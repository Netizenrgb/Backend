# what is short polling 
-> Short polling is a real-time communication method where the client repeatedly requests updates from the server at fixed intervals, regardless of whether new data exists, and the server responds immediately with the current state.

# What is long polling 
-> Long polling is a real-time communication technique where the client sends an HTTP request that the server holds open until new data is ready or a timeout occurs, then immediately sends a new request to maintain the connection. It provides near real-time updates with less overhead than constant polling but uses more server resources than WebSockets