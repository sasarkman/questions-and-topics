# questions-and-topics
Backend assignment I did as part of a job application. Searches for questions whose annotations relate to a specific topic and its sub-topics.

# usage
The API contains one endpoint: "/search" (GET). You can query it like so:

http://**host**/search/?q=**topic**, where:
- **host** is the name or IP of the host
- **topic** is the name of the topic (case-insensitive)
    
# returns
- "Please specify a topic in the "q" query string", if no query string "q" is passed in
- "No such topics found for topic", if topic doesn't exist
- "No such questions found for topic", if questions whose annotations are all exactly contained in topic's sub-topics don't exist
- [Q_1, Q_2, ... , Q_x], where Q is a question number whose annotations are all exactly contained in topic's sub-topics, and x is the amount of questions returned

# examples
1. http://**host**/search/
    - Returns "Please specify a topic in the "q" query string"
2. http://**host**/search/?q=test
    - Returns "No such topics found for topic "test""
3. http://**host**/search/?q=Organisms and their Environment
    - Returns [16,18,57,93,102,113,157]
4. http://**host**/search/?q=nutrition in humans
    - Returns [6,46,47,60,62,63,90,136,185]
5. http://**host**/search/?q=HOMEOSTASIS
    - Returns [17,192]
