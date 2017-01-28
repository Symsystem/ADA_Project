# MOBILITY EVENTS IN SWITZERLAND (SwissTweets)

## Abstract
The main goal of this project will be to create an interactive and intuitive map (focusing on Switzerland) showing the information extracted from the geolocated tweets.

We would like to start by representing the **density** of the tweets in the different cantons and municipalities of Switzerland.

Then, we would like to make an analysis of the **sentiment** associated with the tweets and, again, a visualization according to canton/municipality would be provided.

Finally, we would focus on **event detection** and its visualization. In the end, we would like to have an interactive map (similar to an interactive timeline) highlighting the different events at a given time.

The three maps (density, sentiment and events) share the same underlying **visualization framework**, which is the backbone of this project.


## Results
By the end of the project, we were able to achieve what we proposed to do: a webapp showing different aspects related to geolocated tweets. The webapp can be acessed here: https://symsystem.github.io/ADA_Project/.

There are three main tabs: density map, sentiments map and events map. All the pre-processing, manipulation and generation of the JSON files where done by us, except for the data related to the events map (for which we teamed up with another team).


## Data Description
The dataset consists of geolocated tweets in the Swiss area during seven years (from 2010 to 2016).
We will focus our attention in some particular fields of the tweets:
- **id**, the integer representation of the unique identifier for the tweet;
- **coordinates**, which represents the geographic location of the tweet as reported by the user;
- **created_at**, which gives the UTC time when the tweet was created;
- **text**, which corresponds to the actual UTF-8 text of the status update;
- **user**, which corresponds to the user who posted the tweet.


## Feasibility and Risks
One of the main difficulties will be to deal with the **visualization libraries and tools**, since those have never been used by any of the group members.
Implementing an **interactive timeline** encompassing all the desired functionalities will also be one of the problems the team will encounter.
Furthermore, the web page/web application should take into account the **customizable parameters** and map them into a specific visualization that illustrates everything in a perceptible manner.


## Deliverables
By the end of the project, we would like to deliver a web page/web application with which the users would be able to interact, namely they would be able to go through the timeline to see the evolution of the mobility flows of the users, as well as see the same evolution in a personalized period of time.


## Timeplan

![alt text](https://github.com/Symsystem/ADA_Project/raw/master/images/gantt_chart.png)

All the data will be gathered from the clusters during November and, by the end of the month, all the data will be clean (picking the most relevant users, etc...).
Throughout December, we'll implement the visualization, but in a static way. By the end of the month, we'll start adding interactivity to it. We'll also start drawing some conclusions to help us go from one stage to the other.
January will be dedicated to build the interactive application (timeline and customizable parameters). The final conclusions will be gathered and we'll take some time to prepare the symposium.
