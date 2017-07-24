#Image Search Abstraction Project

##About
This is willitt's implemenation of the FCC Image Search Abstraction layer. The purpose of this project is to create an endpoint by which one can search for images based on a term of their choosing and receive a json response providing a list of results containing the image url, image title and the source site of the image. The other part of the implementation is to retreive a list of recent searches upon the request of a related endpoint. For my implementation I've abstracted an endpoint for a google custom search I created and provided a list of the last 10 searches made for the list of recent searches.

##Usage
Navigate to /imagesearch/(Your Search Terms here) to receive a json response of the following structure:
{
[
{
url: {Url of Image},
alt: {Title of Image},
pageUrl: {Url of site image came from}
},
...
]
}

Navigate to /latest to receive a json response containg a list of the last 10 searched items in the following structure:
[
{
query: {Query terms for search},
when: {Time request made}
},
...
]