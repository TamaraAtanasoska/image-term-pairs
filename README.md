# Image-term pairs for an image-grounded agreement game

## Setup

### Environment recreation 

In the folder ```setup/``` you can find the respective environment replication and package requirements files. There are two options:

  1. You can run ```pip install -r setup/requirements.txt``` to install the necessary packages in your existing environment.

  2. If you are using [conda](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html) to manage your virtual environments, you can replicate and activate the full exact environment with the following commands:

   ```
   conda env create --name <name> --file setup/conda.yml
   conda activate <name>
   ```

## Generating word-image pairs 

This project aims to find image-term pairs for a collaborative, image-grounded [Wordle game](https://github.com/clp-research/slurk-bots/tree/master/wordle). The image-term pairs creation should be automated, able to be measured for difficulty and potential to spark [word-meaning negotiation sequences](https://journals.sagepub.com/doi/abs/10.1177/1461445619829234?journalCode=disa), and be fun enough for players to enjoy playing. 

This project is very much a work in progress. It is a part of an individual research module, [Cognitive Systems program](https://www.ling.uni-potsdam.de/cogsys/), [University of Potsdam](https://www.uni-potsdam.de/de/). 

### Using a subset of ImageNet

[ImageNet](https://image-net.org/index.php) is a really large dataset for computer vision, freely available for research purposes. There isn't a direct possibility to directly download a subset of a more manageable size, except downloading a certain [Synset](https://en.wikipedia.org/wiki/Synonym_ring) as explained on the [website](https://image-net.org/download-images.php). You would need to be logged in and have already submitted a request(and have it approved) to see the full list of links and possibilities. 

Some subsets that could be an example: [here](https://github.com/fastai/imagenette) and [here](https://www.kaggle.com/datasets/ifigotin/imagenetmini-1000). You could place the subsets in a ```image_datasets/imagenet/``` folder. The [words.txt](src/words.txt) file contains the names of all the available Synsets at the time of the creation of this repository, and most likely the subsets you will download will be contained in it. 

#### Generating the ImageNet term-image pairs

To generate term-image pairs, you will have to run the [create_pairs.py](src/create_pairs.py) script. The only mandatory argument to the script is a path to the images, which it will use to create the pairs. 

The term-image pair creation process is as follows:
1. The script takes the folder with ImageNet Synsets and finds the term that identifies each in the words.txt file. 
2. Related synonyms, hypernyms and ConceptNet related terms are retrieved. This step might last for a while because of the API limits. 
3. An intermediate terms_*.json file is generated with all the terms, scored for relatedness to the original word and frequency of the word found in various corpora. 
4. The term-image pairs are built taking the constraints passed into consideration. 

Note: currently when the term-image pairs are built a random image is picked from the available from the Synset. 

Options that can be passed to the pair creation script: 
```
python src/create_pairs.py
--image_path <path> #REQUIRED path to the images
--terms_path <path> #path to a file with scored related terms
--difficulty <float> #a score between 0-1 for relatedness between term and image
--frequency <float> #frequency of word in copora, score between 0-8
--num_synsets <int> #how many synsets for the pairs
--per_synset <int> #how many pairs per synset
--exclude_direct_mapping #exclude the direct Synset-word mapping terms
```

#### Relatedness scoring, word frequency and term sources

##### Relatedness scoring 

All the terms contain relatedness scores. They attempt to measure how related the terms are to the word representing the ImageNet Synset. 
- The direct word representing the Synset, extracted from [words.txt](src/words.txt) has the score 1, the highest score for relatedness. 
- The synonyms and hypernyms, retrieved through using the [wordhoard](https://wordhoard.readthedocs.io/en/latest/) library, have 0.8 and 0.6 as a score. This is a prefixed score that can be changed in the script [here](https://github.com/TamaraAtanasoska/image-term-pairs/blob/setup-files-dics/src/create_pairs.py#L55). The related terms from [ConceptNet](https://conceptnet.io/) come with their [own scoring](https://github.com/TamaraAtanasoska/image-term-pairs/blob/setup-files-dics/src/create_pairs.py#L72) retrievable from the API. If one is the direct mapping, 0 would be completely unrelated. This was already how the ConceptNet related terms were scored, and it was then replicated in the script own scorings. 
- If a there are two different scores for a word, [they get averaged](https://github.com/TamaraAtanasoska/image-term-pairs/blob/setup-files-dics/src/create_pairs.py#L150) into one. 

The APIs the ```wordhoard``` library uses to retrieve the synonyms and hypernyms are documented [here](https://github.com/johnbumgarner/wordhoard#sources). 

##### Word frequency

The "word frequency" refers to how often a word is featured in a corpus. The [wordfreq](https://github.com/rspeer/wordfreq) library features [multiple corpora](https://github.com/rspeer/wordfreq#sources-and-supported-languages) and combines the scores to get an approximation. [The script](https://github.com/TamaraAtanasoska/image-term-pairs/blob/setup-files-dics/src/create_pairs.py#L23) uses the special [zipf_frequency](https://github.com/rspeer/wordfreq#usage) for which values between 0 and 8 make the most sense. In this case, the higher number means more frequent. 
