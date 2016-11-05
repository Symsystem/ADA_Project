# MOBILITY FLOWS IN SWITZERLAND (SwissFlows)

## Abstract
The main goal of this project will be to create an interactive map (focusing on Switzerland) showing all the information obtained from the geolocated tweets in a intuitively manner.
We would like to start by representing the daily routine of the users based on their geolocation throughout the day. We could then identify events that potentially changed these normal commutations. A timeline focusing on the different users would help identify such events since a disruption  (either occasional or permanent) in this routine would be visible.
By analysing the tweets’ content (including hashtags) we could identify patterns in the group behavior during certain events, like concerts, conventions, etc…


## Data Description
The dataset consists of geolocated tweets in the Swiss area during four years.
We will focus our attention in some particular fields of the tweets:
- id, the integer representation of the unique identifier for the tweet;
- coordinates, which represents the geographic location of the tweet as reported by the user;
- created_at, which gives the UTC time when the tweet was created;
- text, which corresponds to the actual UTF-8 text of the status update;
- user, which corresponds to the user who posted the tweet.


## Feasibility and Risks
- Dealing with the visualization libraries and tools will take some time.
- The interactive timeline with all the functionalities will be difficult to implement.
- Creating a kind of web application with parameters we want to input => creating a specific map based on these parameters.


## Deliverables
By the end of the project we would like to present a web page/web application with which the users would be able to interact, namely they would be able to go through the timeline to see the evolution of the mobility flows of the users, as well as see the same evolution in a personalized period of time.


## Timeplan
- By the end of November the data have been cleaned.
- Before the vacations: at least one map has been done. We can make first conclusions.
- Everything finished for the end of January
