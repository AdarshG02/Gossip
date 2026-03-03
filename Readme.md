================================================================================
                        GOSSIP - SIMPLE EXPLANATION
================================================================================
Written for your future self. Same system as Technical.txt, simpler words.
================================================================================

WHAT IS THIS APP?
-----------------
A chat app. You sign up, log in, pick someone to chat with, and send messages.
Messages show up right away if both people are online. They stay saved in a 
database so you can read them later.


--------------------------------------------------------------------------------
WHAT HAPPENS WHEN A USER SIGNS UP
--------------------------------------------------------------------------------

1. User fills out a form: username, email, password.
2. The form sends this to the server (POST /api/signup).
3. Server checks:
   - Is the username already taken? If yes, say "Username already taken."
   - Is the email already used? If yes, say "Already a member."
4. Server hashes the password (turns it into gibberish so it's not stored as 
   plain text).
5. Server saves the new user (username, email, hashed password) in the database.
6. Server says "User signed up successfully."
7. The app shows an alert and switches to the login form. User must log in next.
   (No automatic login after signup.)


--------------------------------------------------------------------------------
WHAT HAPPENS WHEN A USER LOGS IN
--------------------------------------------------------------------------------

1. User enters username and password, clicks Login.
2. The form sends this to the server (POST /api/login).
3. Server looks up the user by username in the database.
4. If no user found: "User not found."
5. Server compares the typed password with the stored (hashed) password.
6. If they don't match: "Invalid credentials."
7. If they match:
   - Server creates a "token" (a signed string that says "this person is user X").
   - The token expires in 1 hour.
   - Server sends the token back.
8. The app stores the token in the browser (localStorage).
9. The app sends the user to the home/chat page.


--------------------------------------------------------------------------------
WHAT HAPPENS WHEN TWO USERS OPEN CHAT
--------------------------------------------------------------------------------

User A:
1. Logs in, lands on Home page.
2. App fetches the list of other users (everyone except A). Uses the token to prove identity.
3. App connects to a WebSocket (a live pipe) with the token so the server knows who A is.
4. App shows the list of users. A clicks on User B.

User B:
1. Same steps as A. B is on the Home page, sees the list, can click on A.

When A clicks B:
- App fetches all past messages between A and B from the server.
- Those messages appear in the chat area.
- A can type and send. B can do the same.

So "opening chat" = selecting a user. That triggers loading the message history 
and showing the chat box. No special "room" is created—it's just loading the 
conversation between those two people.


--------------------------------------------------------------------------------
WHAT HAPPENS WHEN SOMEONE SENDS A MESSAGE
--------------------------------------------------------------------------------

1. User types text and clicks Send.
2. App sends the message to the server (POST /api/messages) with:
   - The token (to prove who is sending)
   - The receiver's ID (who gets it)
   - The message text
3. Server checks the token to make sure the sender is logged in.
4. Server saves the message in the database (sender, receiver, content, timestamp).
5. Server checks: is the receiver currently online? (It keeps a list of who is 
   connected via WebSocket.)
6. If the receiver IS online: the server sends the message to them instantly 
   through the WebSocket ("receiveMessage" event).
7. The server also sends the saved message back to the sender (the normal HTTP 
   response).
8. The sender's app adds that message to the screen right away (from the response).
9. If the receiver was online, their app also adds it from the WebSocket.

So the sender always sees their message right away from the server's reply. 
The receiver sees it right away only if they're online—via the WebSocket.


--------------------------------------------------------------------------------
HOW MESSAGES APPEAR INSTANTLY
--------------------------------------------------------------------------------

Two paths:

Path 1 — For the person who sent the message:
- They get the message back from the same HTTP request they made.
- The app appends it to the list of messages on screen.
- Feels instant because it happens as soon as the server responds.

Path 2 — For the person who receives the message:
- They have a WebSocket connection open to the server.
- When the sender's message is saved, the server looks up "is the receiver 
  connected?" 
- If yes, it sends the message through that WebSocket.
- The receiver's app is listening for "receiveMessage".
- When it gets it, it adds the message to the screen.
- No page refresh, no new request—it just shows up.

Think of it like a phone call vs. a letter. WebSocket = phone call (instant). 
HTTP request = letter (you send, wait for reply). The sender uses the "letter" 
reply to update their screen. The receiver gets a "phone call" with the new message.


--------------------------------------------------------------------------------
HOW MESSAGES ARE SAVED
--------------------------------------------------------------------------------

Every message goes through the server. The server always saves it in a database 
(MongoDB) before doing anything else.

Each saved message has:
- Who sent it (sender ID)
- Who receives it (receiver ID)
- The text (content)
- When it was created (automatic timestamp)

When you open a chat with someone, the app asks the server: "Give me all 
messages between me and this person." The server queries the database and 
returns them in order (oldest first). No messages are kept only in the browser— 
they all live in the database.


--------------------------------------------------------------------------------
HOW ONLINE USERS ARE TRACKED
--------------------------------------------------------------------------------

When you load the home page, the app opens a WebSocket connection to the server 
and sends the token.

The server:
1. Verifies the token.
2. From the token, it learns your user ID.
3. It stores: "user X is connected, and their WebSocket ID is Y" in a simple 
   in-memory list (a Map: userId -> socketId).
4. When you disconnect (close tab, go offline), the server removes you from 
   that list.

So the server knows who is "online" at any moment: anyone in that list.

Right now, the app does NOT show "online" or "offline" next to usernames in the 
UI. The tracking exists so the server can decide whether to send a new message 
instantly over the WebSocket (receiver online) or not (receiver offline—they'll 
see it when they load the chat later).


--------------------------------------------------------------------------------
QUICK REFERENCE: STEP-BY-STEP FLOWS
--------------------------------------------------------------------------------

Sign up:  Form -> POST /api/signup -> Validate -> Hash password -> Save user -> 
          "Sign up successful, please login"

Login:    Form -> POST /api/login -> Find user -> Compare password -> Create token ->
          Return token -> Save token in browser -> Go to home

Open chat: Click user -> Fetch messages for that pair -> Show chat + history

Send message: Type + Send -> POST /api/messages (with token) -> Server saves in DB ->
              If receiver online: emit over WebSocket -> Add to sender UI from response
              -> Add to receiver UI from WebSocket

Load history: GET /api/messages/:userId (with token) -> Server finds all messages 
              between you and that user -> Returns sorted list -> App displays them


--------------------------------------------------------------------------------
ANALOGIES
--------------------------------------------------------------------------------

Token = A stamped ticket. You get it at login. You show it with every request 
        so the server knows who you are.

WebSocket = A telephone line. Stay open. Server can call you anytime with new 
            messages. No need to keep asking "any new messages?"

Database = A filing cabinet. All messages are filed. When you open a chat, 
           the server pulls out the folder for you and that person.


================================================================================
                              END OF SIMPLE DOCUMENTATION
================================================================================
