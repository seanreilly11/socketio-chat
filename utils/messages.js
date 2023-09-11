function formatMessage(username, message, room) {
    return {
        username,
        message,
        room,
        time: Date.now(),
    };
}

module.exports = formatMessage;
