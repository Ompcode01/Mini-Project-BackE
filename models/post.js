const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: String,
    likes: [//arrays of ids
        { type: mongoose.Schema.Types.ObjectId, ref: 'user' } //users like krenge isliye unki ids hogi
    ]
});

module.exports = mongoose.model('post', postSchema);