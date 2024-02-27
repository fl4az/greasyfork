let connected = false
let username = null
let type = 0;
let clan = null
let wasDragged = false
let isFetching = true
let fetched_once = false
dragElement(document.getElementById("draggable"));
document.getElementById("draggable").style.top = localStorage.getItem("save-box-pos-top")
document.getElementById("draggable").style.left = localStorage.getItem("save-box-pos-left")
document.getElementById("chatboxContainer").style.width = localStorage.getItem("save-box-resize-width")
document.getElementById("chatboxContainer").style.height = localStorage.getItem("save-box-resize-height")
window.setInterval(() => {
    localStorage.setItem("save-box-resize-width", document.getElementById("chatboxContainer").style.width)
    localStorage.setItem("save-box-resize-height", document.getElementById("chatboxContainer").style.height)
}, 5000)
document.querySelector("#chatboxInput").addEventListener('keydown', function(e) {
    e.stopImmediatePropagation();
});
document.querySelector("#chatboxInput").addEventListener('keypress', function(e) {
    e.stopImmediatePropagation();
});
document.querySelector("#chatboxInput").addEventListener('keyup', async function(e) {
    e.stopImmediatePropagation();
    if ((e.key === 'Enter' || e.keyCode === 13) && document.querySelector("#chatboxInput").value != "") {
        let message = document.querySelector("#chatboxInput").value;
        document.querySelector("#chatboxInput").value = "";
        await sendMessage(message);
    }
});

function togglehideChatBox() {
    if (wasDragged == true) {
        wasDragged = false;
        return;
    }
    document.querySelector("#chatboxMinimizedButton").classList.toggle("hidden")
    document.querySelector("#chatboxMinimizedButton").classList.toggle("visible")
    document.querySelector("#chatboxContainer").classList.toggle("hidden")
    document.querySelector("#draggable").classList.toggle("hidden")
    try {
        document.querySelector("#chatNotification").remove()
    } catch {
        ;
    }
}
window.togglehideChatBox = togglehideChatBox

function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById("chatboxHeader")) {
        document.getElementById("chatboxHeader").onmousedown = dragMouseDown;
        document.getElementById("chatboxMinimizedButton").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        wasDragged = true
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        localStorage.setItem("save-box-pos-top", (elmnt.offsetTop - pos2) + "px")
        localStorage.setItem("save-box-pos-left", (elmnt.offsetLeft - pos1) + "px")
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function addMessageToBox(clan, name, message, customClass, adminlevel, message_id, timestamp) {
    if (message_id != undefined && (document.querySelector(".message-" + message_id) != null && message_id != undefined)) {
        return
    }
    if (document.querySelector("#chatboxMinimizedButton").classList.contains("visible")) {
        if (document.querySelector("#chatNotification")) {
            document.querySelector("#chatNotification > div").textContent = parseInt(document.querySelector("#chatNotification > div").textContent) + 1
        } else {
            let chatNotifDiv = document.createElement("div")
            let chatNotifCountDiv = document.createElement("div")
            chatNotifDiv.className = "new-message-notification"
            chatNotifDiv.id = "chatNotification"
            chatNotifCountDiv.style.paddingRight = '0.5px'
            chatNotifCountDiv.textContent = 1
            chatNotifDiv.append(chatNotifCountDiv)
            document.querySelector("#chatboxMinimizedButton").prepend(chatNotifDiv)
        }
    }
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container");
    messageContainer.classList.add("message-" + message_id)
    const messageTimestampSpan = document.createElement("span")
    messageTimestampSpan.classList.add("message-timestamp")
    messageTimestampSpan.textContent = "(" + timestamp + ")"
    var authorClanSpan;
    if (clan != null) {
        authorClanSpan = document.createElement("span");
        authorClanSpan.classList.add("message-author-clan");
        authorClanSpan.classList.add("clan-" + clan + "-color");
        authorClanSpan.textContent = "[" + clan + "]";
    }
    var authorNameSpan;
    if (name != null) {
        authorNameSpan = document.createElement("span");
        authorNameSpan.classList.add("message-author-name");
        authorNameSpan.textContent = name + ":";
        if (adminlevel == 3) {
            authorNameSpan.classList.add("admin-3");
        }
        authorNameSpan.addEventListener("click", () => {
            try {
                a = document.evaluate(`//*[@id="normal_left"]/table/tr/td[contains(., '${name}')]`, document, null, XPathResult.ANY_TYPE, null).iterateNext().click()
            } catch {
                ;
            }
        })
    }
    const messageContentSpan = document.createElement("span");
    messageContentSpan.classList.add("message-content");
    messageContentSpan.textContent = message;
    let copySpan = messageContentSpan.innerHTML
    copySpan = copySpan.replace(/(https?:\/\/(image\.){0,1}(risibank|noelshack)\.(fr|com)\/\S+\.(?:png|jpg|gif|jpeg))/gi, '<img src="$1" alt="$1" style="max-width: 60px; cursor:pointer;">');
    messageContentSpan.innerHTML = copySpan
    if (customClass != null) {
        messageContentSpan.classList.add(customClass)
    }
    if (timestamp != undefined) {
        messageContainer.appendChild(messageTimestampSpan);
    }
    if (clan != null) {
        messageContainer.appendChild(authorClanSpan);
    }
    if (name != null) {
        messageContainer.appendChild(authorNameSpan);
    }
    messageContainer.appendChild(messageContentSpan);
    document.querySelector("#chatbox > .messages-container").appendChild(messageContainer);
    var objDiv = document.getElementById("chatbox");
    objDiv.scrollTop = objDiv.scrollHeight;
}
async function risitas(user_clan, user_name) {
    await fetch('https://starter-express-api-eg33.onrender.com/risitas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            clan: user_clan,
            nickname: user_name
        }),
    }).then(response => {
        if (response.status == 200) {
            response.json().then(data => {
                addMessageToBox(null, null, "You are now registered. Your ID is: " + data.id, "system-success");
            });
        } else {
            addMessageToBox(null, null, "Registration failed", "system-failed");
        }
    });
}
async function connectChat() {
    let id = localStorage.getItem("1825-chat-token");
    let response;
    addMessageToBox(null, null, "Connecting..");
    try {
        response = await fetch("https://starter-express-api-eg33.onrender.com/connect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id
            })
        });
    } catch {
        addMessageToBox(null, null, "Connection failed. You can connect using /connect <token-id>", "system-failed-connection");
        connected = false;
        isFetching = false;
        return;
    }
    if (response.status != 200) {
        addMessageToBox(null, null, "Connection failed. You can connect using /connect <token-id>", "system-failed-connection");
        connected = false;
    } else {
        addMessageToBox(null, null, "Connected", "system-connection-success");
        await response.json().then(data => {
            clan = data.clan;
            username = data.nickname;
        });
        connected = true;
    }
    isFetching = false;
}
async function handleCommands(message) {
    let id = localStorage.getItem("1825-chat-token")
    if (message.startsWith("/risitas ") && message.split(" ").length >= 3) {
        const [_, user_clan, user_name] = message.split(" ");
        risitas(user_clan, user_name);
    } else if (message.startsWith("/connect ")) {
        localStorage.setItem("1825-chat-token", message.split(" ")[1])
        await connectChat()
    } else if (message.startsWith("/changeclan ") && message.split(" ")[1].length > 0) {
        await fetch("https://starter-express-api-eg33.onrender.com/change_clan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                newclan: message.split(" ")[1]
            })
        }).then(response => {
            if (response.status == 200) {
                addMessageToBox(null, null, "You changed your clan !", "system-success");
                clan = message.split(" ")[1];
            } else {
                addMessageToBox(null, null, "Failed to change clan.", "system-failed");
            }
        });
    } else if (message.startsWith("/changename ") && message.split(" ")[1].length > 0) {
        await fetch("https://starter-express-api-eg33.onrender.com/change_name", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                newname: message.split(" ")[1]
            })
        }).then(response => {
            if (response.status == 200) {
                addMessageToBox(null, null, "You changed your name !", "system-success");
                username = message.split(" ")[1];
            } else {
                addMessageToBox(null, null, "Failed to change name.", "system-failed");
            }
        });
    } else if (message.startsWith("/help")) {
        addMessageToBox(null, null, "List of commands:", "system-help-commands")
        addMessageToBox(null, null, "/connect <token>", "system-help-commands")
        addMessageToBox(null, null, "/changename <new_name>", "system-help-commands")
        addMessageToBox(null, null, "/changeclan <new clan>", "system-help-commands")
        addMessageToBox(null, null, "/help", "system-help-commands")
    }
}

function getTimeFormated(timestamp) {
    const now = timestamp != undefined ? new Date(timestamp) : new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours}:${minutes<10?'0':''}${minutes}`;
    return formattedTime
}
async function sendMessage(message) {
    if (message.startsWith("/")) {
        await handleCommands(message);
        return;
    } else if (connected === true) {
        let id = localStorage.getItem("1825-chat-token");
        addMessageToBox(clan, username, message, null, type, undefined, getTimeFormated());
        await fetch("https://starter-express-api-eg33.onrender.com/send_message", {
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                userId: id,
                message: message
            })
        });
    } else if (connected === false) {
        addMessageToBox(null, null, "Connection failed. You can connect using /connect <token-id>", "system-failed-connection");
    }
}
async function fetchMessages() {
    let id = localStorage.getItem("1825-chat-token")
    var response;
    isFetching = true
    try {
        response = await fetch("https://starter-express-api-eg33.onrender.com/fetch_messages", {
            method: "POST",
            headers: {
                "id": id,
                "fetchedonce": fetched_once
            }
        })
    } catch {
        isFetching = false
        return
    }
    response.text().then((data) => {
        data = JSON.parse(data)
        data = data.reverse()
        for (let message of data) {
            if (fetched_once == true && username == message["user_name"]) {
                continue
            }
            addMessageToBox(message["user_clan"], message["user_name"], message["message"], null, message["user_type"], message["message_id"], getTimeFormated(message["timestamp"]))
        }
        fetched_once = true
        isFetching = false
    })
}
connectChat()
window.setInterval(() => {
    if (isFetching == false) fetchMessages()
}, 2500)
