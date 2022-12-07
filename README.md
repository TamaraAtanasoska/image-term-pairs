# Image-term pairs for an image-grounded agreement game

## Generating word-image pairs 

This project aims to find image-term pairs for a collaborative, image-grounded [Wordle game](https://github.com/clp-research/slurk-bots/tree/master/wordle). The image-term pairs creation should be automated, able to be measured for difficulty and potential to spark [word-meaning negotiation sequences](https://journals.sagepub.com/doi/abs/10.1177/1461445619829234?journalCode=disa), and be fun enough for players to enjoy playing. 

This project is very much a work in progress. It is a part of an individual research module, [Cognitive Systems program](https://www.ling.uni-potsdam.de/cogsys/), [University of Potsdam](https://www.uni-potsdam.de/de/). 

### Using a subset of ImageNet

[ImageNet](https://image-net.org/index.php) is a really large dataset for computer vision, freely available for research purposes. There isn't a direct possibility to directly download a subset of a more manageable size, except downloading a certain [Synset](https://en.wikipedia.org/wiki/Synonym_ring) as explained on the [website](https://image-net.org/download-images.php). You would need to be logged in and have already submitted a request(and have it approved) to see the full list of links and possibilities. 

Some subsets that could be an example: [here](https://github.com/fastai/imagenette) and [here](https://www.kaggle.com/datasets/ifigotin/imagenetmini-1000). You could place the subsets in a ```image_datasets/imagenet/``` folder. The [words.txt](src/words.txt) file contains the names of all the available Sysnets at the time of the creation of this repository, and most likely the subsets you will download will be contained in it. 
