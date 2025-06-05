const documentAPIs = require('./document.js');
const chapterAPIs = require('./chapter.js');
const paragraphAPIs = require('./paragraph.js');
const Document = require('./models/Document.js');
const Chapter = require('./models/Chapter.js');
const Paragraph = require('./models/Paragraph.js');
module.exports = {
    ...documentAPIs,
    ...chapterAPIs,
    ...paragraphAPIs,
    Document,
    Chapter,
    Paragraph,
    documentTypes: {
        SNAPSHOT: 'snapshot',
        DOCUMENT: 'document',
        CHAT: 'chat'
    }
};
