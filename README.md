# Image-term pairs for an image-grounded agreement game

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
3. An intermediate terms_*.json file is generated with all the terms, scored for relatedness to the original word. 
4. The term-image pairs are built taking the constraints passed into consideration. 

Note: currently when the term-image pairs are built a random image is picked from the available from the Synset. 

Options that can be passed to the pair creation script: 
```
python src/create_pairs.py
--image_path #REQUIRED path to the images
--terms_path #path to a file with scored related terms
--difficulty #a score between 0-1 for relatedness between term and image
--num_synsets #how many synsets for the pairs
--per_synset #how many pairs per synset
```
