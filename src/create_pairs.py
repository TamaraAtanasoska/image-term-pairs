import argparse
import json
import requests
import pathlib
import os
import time
import re
import uuid

from collections import ChainMap
from random import choice

from profanity_check import predict_prob
from wordhoard import Synonyms, Hypernyms


def _build_syn_hyp_list(words: list, weight: float):
    """
    This function gives shape to the retrieved synonyms and hypernyms. It takes a
    given list of words and a set weight for all words of type and makes word:weight
    pairs. Additionally, there is profanity check.
    """
    weighted = []
    if isinstance(words, list):
        if "spelled correctly" in words[0]:
            weighted = []
        else:
            [weighted.append({w: weight}) for w in words if predict_prob([w]) < 0.5]
    return dict(ChainMap(*weighted))


def get_syn_hyper(word: str):
    """
        A function to all the wordhoard related APIs and retrieve a given word's
    synonyms and hypernyms.
    """
    synonym = Synonyms(search_string=word)
    hypernym = Hypernyms(search_string=word)

    synonyms = synonym.find_synonyms()
    hypernyms = hypernym.find_hypernyms()

    syn_list = _build_syn_hyp_list(synonyms, 0.8)
    hyper_list = _build_syn_hyp_list(hypernyms, 0.6)
    return syn_list, hyper_list


def get_related_terms(word: str):
    """
        This function calls the ConceptNet API and gets the 10 most related
    terms and their weights.
    """
    obj = requests.get(
        "https://api.conceptnet.io/related/c/en/" + word + "?filter=/c/en"
    ).json()
    terms = []
    for term in obj["related"]:
        word = term.get("@id").split("/")[-1].replace("_", " ")
        if predict_prob([word]) < 0.5:
            terms.append({word: term.get("weight")})
    return dict(ChainMap(*terms))


def generate_file(synsets_words: list):
    """
        This function takes the words associated with each synset and generates a
    file with their synonyms, hypernims, hyponims and weighted related terms from
    ConceptNet. Some APIs have a very low limit on calls, and a long wait time
    is necessary, additionally because of a bug in the library."
    """
    term_list = []
    filename = str("terms_" + str(uuid.uuid4())) + ".json"
    file_path = os.getcwd() + "/" + filename

    print("Number of words to process: ", len(synsets_words))
    for num_word, word in enumerate(synsets_words):
        related_terms = get_related_terms(word[1])
        synonyms, hypernyms = get_syn_hyper(word[1])

        term_list.append(
            [
                {"Synset": word[0]},
                {"Word": {word[1]: 1}},
                {"Synonyms": synonyms},
                {"Hypernyms": hypernyms},
                {"ConceptNet related terms": related_terms},
            ]
        )

        time.sleep(3)
        print("Processed word number ", num_word + 1, " : ", word[1])
    with open(filename, "w", encoding="utf-8") as terms_file:
        json.dump(
            term_list,
            terms_file,
            ensure_ascii=False,
            indent=4,
        )
    print("All the words finished processing!")
    print("Path to full terms file: ", file_path)
    return file_path


def synset_to_word():
    """
        This function generates a list of available synsets in the image directory
    and their idenfifying words. It takes the path ts the image directory and the
    file that lists all available ImageNet words, then creates a joint list.
    """
    cur_dir = os.getcwd()

    os.chdir(args.image_path)
    synsets = [name for name in os.listdir(".") if os.path.isdir(name)]

    os.chdir(cur_dir)
    lines = [
        re.split(r"[ ]*[,\t\n][ ]*", x.strip()) for x in open("words.txt").readlines()
    ]
    return [[l[0], l[1]] for l in lines if s == l[0] for s in synsets]


def _preprocess_terms(terms: list):
    """
    This function reduceds all the related words to just the possible pairs with 5
    letters. Additionally whenever there are multiple weight estimations for a word,
    it averages the weight between the two.
    """
    all_terms = []
    for term in terms:
        one_dict = {k: v for d in term for k, v in d.items() if k != "Synset"}
        only_terms = []
        for values in one_dict.values():
            for k, v in values.items():
                if k in only_terms:
                    v = round(((v + only_terms.get(k)) / 2), 3)
                    only_terms.remove(k)
                only_terms.append({k.strip(): v})

        only_terms = dict(ChainMap(*only_terms))
        only_5_char = {k: v for k, v in only_terms.items() if len(k) == 5}
        all_terms.append([*term[0].values(), only_5_char])
    return all_terms


def _reduce_by_difficulty(pairs: list):
    """
    This function applies a difficulty filter. An association between words is
    considedred easier the closer it is to 1.
    """
    all_terms = []
    diff = args.difficulty
    for sys in pairs:
        terms = []
        [terms.append({k: v}) for k, v in sys[1].items() if sys[1].get(k) >= diff]
        if terms:
            all_terms.append([sys[0], dict(ChainMap(*terms))])
    return all_terms


def _reduce_per_synset(pairs: list):
    """
    This function applies a filter reducing the number of pairs for each Synsnet.
    """
    reduced_terms = []
    for sys in temp_pairs:
        reduced_terms.append(
            [sys[0], {k: sys[1][k] for k in list(sys[1])[: args.per_synset]}]
        )
    return reduced_terms


def _create_final_pairs_file(pairs: list):
    """
    This function writes to a .tsv file with the final version of the pairs to be
    used in the game.
    """
    cur_dir = os.getcwd()

    os.chdir(args.image_path)
    final_pairs = []
    for pair in pairs:
        for term in pair[1].items():
            image_path = (
                os.getcwd() + "/" + pair[0] + "/" + str(choice(os.listdir(pair[0])))
            )
            final_pairs.append(term[0] + "\t" + image_path + "\n")

    os.chdir(cur_dir)
    with open("image_data.tsv", "w", encoding="utf-8") as f:
        for p in final_pairs:
            f.write(p)
    print("Path to final pairs file: ", os.getcwd() + "/" + "image_data.tsv")


def create_pairs(args: argparse.Namespace):
    """
        The main function to create the pairs. Retrieves the synsets, words and all
    required related terms, then makes custom defined pairs according to the
    parameters passed to the script. To skip the generation and go direclty to
    pair creation, a generated terms file needs to be passed.
    """
    terms_file = ""
    if not args.terms_path:
        synsets_words = synset_to_word()
        terms_file = generate_file(synsets_words)
    else:
        terms_file = args.terms_path

    with open(terms_file, "r") as terms:
        possible_pairs = _preprocess_terms(json.loads(terms.read()))

    temp_pairs = possible_pairs
    if args.difficulty:
        temp_pairs = _reduce_by_difficulty(temp_pairs)
    elif args.per_synset:
        temp_pairs = _reduce_by_difficulty(temp_pairs)
    elif args.num_synsets:
        temp_pairs = [random.choice(temp_pairs) for _ in range(args.num_synsets)]

    _create_final_pairs_file(temp_pairs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--image_path",
        type=pathlib.Path,
        help="Path to images",
        required=True,
    )
    parser.add_argument(
        "--terms_path",
        type=pathlib.Path,
        help="Path to generated terms file",
        required=False,
    )
    parser.add_argument(
        "--difficulty",
        type=float,
        help="Difficulty threshold",
        required=False,
    )
    parser.add_argument(
        "--num_synsets",
        type=int,
        help="Number of pairs",
        required=False,
    )
    parser.add_argument(
        "--per_synset",
        type=int,
        help="Number of pairs per Synset",
        required=False,
    )
    args = parser.parse_args()
    create_pairs(args)
