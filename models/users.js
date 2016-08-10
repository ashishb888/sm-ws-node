validate: function(decoded, request, callback) {
    const promise = new User({
        id: decoded.id
    }).fetch();
    promise.then(function(data) {
        if (data === null) {
            return callback(null, false);
        } else {
            return callback(null, true);
        }
    });
    promise.catch(function(e) {
        return callback(null, false);
    });
}
