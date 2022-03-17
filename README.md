# questions-and-topics
Backend assignment I did as part of a job application. Searches for questions whose annotations relate to a specific topic and its sub-topics.

# usage
The API contains one endpoint: "/search" (GET). You can query it like so:

http://**host**/search/?q=**topic**, where:
- **host** is the name or IP of the host
- **topic** is the name of the topic (case-insensitive)
    
# returns
- "No such topics found for topic", if topic doesn't exist
- "No such questions found for topic", if questions whose annotations are all exactly contained in topic's sub-topics
- [Q_1, Q_2, ... , Q_x], where Q is a question number whose annotations are all exactly contained in topic's sub-topics, x is amount of questions returned
