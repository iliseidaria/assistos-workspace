module.exports = {
    DEFAULT_ID_LENGTH: 16,
    DEFAULT_PERSONALITY_NAME: "Assistant",
    ENV_TYPE: {
        NODE: "node",
        BROWSER: "browser",
        UNKNOWN: "unknown"
    },
    ENVIRONMENT_MODE: "DEVELOPMENT_BASE_URL",
    PRODUCTION_BASE_URL: "http://demo.assistos.net:8080",
    DEVELOPMENT_BASE_URL: "http://localhost:8080",
    COMMANDS_CONFIG: {
        ATTACHMENTS:[
            "files",
            "effects",
            "image",
            "video",
            "audio",
            "silence"
        ],
        ORDER: [
            "files",
            "audio",
            "effects",
            "image",
            "video",
            "speech",
            "silence",
            "lipsync",
            "compileVideo"
        ],
        EMOTIONS: {
            'female_happy': 'Female Happy',
            'female_sad': 'Female Sad',
            'female_angry': 'Female Angry',
            'female_fearful': 'Female Fearful',
            'female_disgust': 'Female Disgust',
            'female_surprised': 'Female Surprised',
            'male_happy': 'Male Happy',
            'male_sad': 'Male Sad',
            'male_angry': 'Male Angry',
            'male_fearful': 'Male Fearful',
            'male_disgust': 'Male Disgust',
            'male_surprised': 'Male Surprised'
        },
        COMMANDS: [
            {
                NAME: "speech",
                NOT_ALLOWED_ALONG: ["silence"],
                VALIDATE: async (spaceId, paragraph, securityContext) => {
                    const personalityModule = require('assistos').loadModule('personality', securityContext);
                    if (!paragraph) {
                        throw ("Paragraph not found");
                    }
                    if (paragraph.text.trim() === "") {
                        throw ("Paragraph text is empty");
                    }
                    if (!paragraph.commands["speech"]) {
                        throw ("Paragraph Must have a speech command");
                    }
                    const speechPersonality = paragraph.commands["speech"].personality;
                    const personalityData = await personalityModule.getPersonalityByName(spaceId, speechPersonality);
                    if (!personalityData) {
                        throw `Personality ${speechPersonality} not found`;
                    }
                    if (!personalityData.voiceId) {
                        throw `Personality ${speechPersonality} has no voice configured`;
                    }

                },
                EXECUTE: async (spaceId, documentId, chapterId, paragraphId, securityContext) => {
                    const documentModule = require('assistos').loadModule('document', securityContext);
                    return await documentModule.createTextToSpeechTask(spaceId, documentId, paragraphId);
                },
                PARAMETERS: [
                    {
                        REQUIRED: true,
                        NAME: "personality",
                        SHORTHAND: "p",
                        TYPE: "string",
                    },
                    {
                        NAME: "emotion",
                        SHORTHAND: "e",
                        TYPE: "string",
                        VALUES: ['female_happy',
                            'female_sad',
                            'female_angry',
                            'female_fearful',
                            'female_disgust',
                            'female_surprised',
                            'male_happy',
                            'male_sad',
                            'male_angry',
                            'male_fearful',
                            'male_disgust',
                            'male_surprised']
                    }, {
                        NAME: "styleGuidance",
                        SHORTHAND: "sg",
                        TYPE: "number",
                        MIN_VALUE: 0,
                        MAX_VALUE: 100
                    },
                    {
                        NAME: "taskId",
                        SHORTHAND: "t",
                        TYPE: "string"
                    }
                ]
            },
            {
                NAME: "silence",
                PARAMETERS:
                    [{
                        NAME: "duration",
                        SHORTHAND: "d",
                        TYPE: "number",
                        MIN_VALUE: 1,
                        MAX_VALUE: 3600,
                    }],
                VALIDATE: async function () {
                    return true;
                }
            },
            {
                NAME: "lipsync",
                NOT_ALLOWED_ALONG: ["silence"],
                REQUIRED: [],
                VALIDATE: async (spaceId, paragraph, securityContext) => {
                    if (!paragraph.commands.audio && !paragraph.commands.speech) {
                        throw ("Paragraph Must have an attached audio or a speech command before adding lip sync");
                    }
                    if (!paragraph.commands.image && !paragraph.commands.video) {
                        throw ("Paragraph Must have an image or a video before adding lip sync");
                    }
                    if(paragraph.commands.lipsync.videoId && paragraph.commands.lipsync.imageId){
                        throw ("Cannot have both video and image for lip sync");
                    }
                },
                EXECUTE: async (spaceId, documentId, chapterId, paragraphId, securityContext) => {
                    const documentModule = require('assistos').loadModule('document', securityContext);
                    return await documentModule.createLipSyncTask(spaceId, documentId, paragraphId);
                },
                PARAMETERS:
                    [{
                        NAME: "videoId",
                        TYPE: "string"
                    },
                    {
                        NAME: "imageId",
                        TYPE: "string"
                    },
                    {
                    NAME: "taskId",
                    SHORTHAND: "t",
                    TYPE: "string"
                    }]
            },
            {
                NAME: "audio",
                NOT_ALLOWED_ALONG: ["silence"],
                PARAMETERS: [
                    {
                        REQUIRED:true,
                        NAME: "id",
                        TYPE: "string",
                    },
                    {
                        REQUIRED:true,
                        NAME: "duration",
                        TYPE: "number",
                        MIN_VALUE: 0,
                        MAX_VALUE: 3600
                    },
                    {
                        REQUIRED:true,
                        NAME: "volume",
                        TYPE: "number",
                        DEFAULT: 100,
                        MIN_VALUE: 0,
                        MAX_VALUE: 100
                    },
                ],
                VALIDATE: async (spaceId, resourceId, securityContext) => {
                    /*  const spaceModule = require('assistos').loadModule('space', securityContext);
                      const audio = await spaceModule.getAudioHead(spaceId, resourceId);
                      if (!audio) {
                          throw ("Invalid audio Id");
                      }*/
                }
            },
            {
                NAME:"effects",
                TYPE: "array",
                ITEM_NAME: "effect",
                NOT_ALLOWED_ALONG: ["silence"],
                PARAMETERS: [
                    {
                        REQUIRED:true,
                        NAME: "id",
                        TYPE: "string"
                    },
                    {
                        REQUIRED:true,
                        NAME: "name",
                        TYPE: "string"
                    },
                    {
                        REQUIRED:true,
                        NAME: "duration",
                        TYPE: "number",
                        MIN_VALUE: 0
                    },
                    {
                        REQUIRED:true,
                        NAME: "volume",
                        TYPE: "number",
                        DEFAULT: 100,
                        MIN_VALUE: 0,
                        MAX_VALUE: 100
                    },
                    {
                        REQUIRED:true,
                        NAME: "start",
                        TYPE: "number",
                        MIN_VALUE: 0
                    },
                    {
                        REQUIRED:true,
                        NAME: "end",
                        TYPE: "number",
                        MIN_VALUE: 0
                    },
                    {
                        REQUIRED:true,
                        NAME: "playAt",
                        TYPE: "number",
                        MIN_VALUE: 0
                    },
                    {
                        NAME: "fadeIn",
                        TYPE: "boolean",
                    },
                    {
                        NAME: "fadeOut",
                        TYPE: "boolean",
                    }
                ],
                VALIDATE: async (spaceId, paragraph) => {
                    let effects = paragraph.commands.effects;
                    let audioDuration = paragraph.commands.audio ? paragraph.commands.audio.duration : 0;
                    let videoDuration = paragraph.commands.video ? paragraph.commands.video.end - paragraph.commands.video.start : 0;
                    let maxDuration = Math.max(audioDuration, videoDuration);
                    for(let effect of effects){
                        if(effect.start > effect.end){
                            throw (`Sound effect ${effect.name} start time cannot be greater than end time`);
                        }
                        if(effect.end > effect.duration){
                            throw (`Sound effect ${effect.name} end time cannot be greater than effect duration`);
                        }
                        if(effect.playAt >= maxDuration){
                            throw (`Sound effect ${effect.name} playAt cannot be greater/equal than video duration`);
                        }
                    }

                }
            },
            {
                NAME:"files",
                TYPE: "array",
                ITEM_NAME: "file",
                PARAMETERS: [
                    {
                        REQUIRED:true,
                        NAME: "id",
                        TYPE: "string"
                    },
                    {
                        REQUIRED:true,
                        NAME: "name",
                        TYPE: "string"
                    },
                    {
                        REQUIRED:true,
                        NAME: "type",
                        TYPE: "string"
                    },
                    {
                        REQUIRED:true,
                        NAME: "size",
                        TYPE: "string"
                    }
                ],
                VALIDATE: async (spaceId, paragraph) => {}
            },
            {
                NAME: "video",
                NOT_ALLOWED_ALONG: ["silence"],
                PARAMETERS: [
                    {
                        REQUIRED: true,
                        NAME: "id",
                        TYPE: "string",
                    },
                    {
                        NAME: "thumbnailId",
                        TYPE: "string"
                    },
                    {
                        NAME: "width",
                        TYPE: "number",
                        MIN_VALUE: 1,
                        MAX_VALUE: 10920
                    }, {
                        NAME: "height",
                        TYPE: "number",
                        MIN_VALUE: 1,
                        MAX_VALUE: 10080
                    },
                    {
                        REQUIRED: true,
                        NAME: "volume",
                        TYPE: "number",
                        MIN_VALUE: 0,
                        MAX_VALUE: 100,
                        DEFAULT: 100
                    },
                    {
                        REQUIRED: true,
                        NAME: "duration",
                        TYPE: "number",
                        MIN_VALUE: 0,
                        MAX_VALUE: 3600
                    },
                    {
                        REQUIRED: true,
                        NAME: "start",
                        TYPE: "number",
                        MIN_VALUE: 0,
                    },
                    {
                        REQUIRED: true,
                        NAME: "end",
                        TYPE: "number",
                        MIN_VALUE: 0,
                    }
                ],
                VALIDATE: async (spaceId, paragraph, securityContext) => {
                    // const spaceModule = require('assistos').loadModule('space', securityContext);
                    // const video = await spaceModule.getVideoHead(spaceId, paragraph.commands.video.id);
                    // if (!video) {
                    //     throw ("Invalid video Id");
                    // }
                    let videoCommand = paragraph.commands.video;
                    if(videoCommand.start >= videoCommand.duration){
                        throw ("Invalid video start time");
                    }
                    if(videoCommand.end > videoCommand.duration){
                        throw ("Invalid video end time");
                    }
                }
            },
            {
                NAME: "compileVideo",
                PARAMETERS: [
                    {
                        NAME: "id",
                        TYPE: "string"
                    },
                    {
                        NAME: "taskId",
                        TYPE: "string"
                    }
                ],
                VALIDATE: async (spaceId, paragraph, securityContext) => {
                    let commands = paragraph.commands;
                    if(!commands.image && !commands.video){
                        throw new Error("Paragraph doesnt have a visual source");
                    }
                },
                EXECUTE: async (spaceId, documentId, chapterId, paragraphId, securityContext) => {
                    const documentModule = require('assistos').loadModule('document', securityContext);
                    return await documentModule.createParagraphCompileVideoTask(spaceId, documentId, chapterId, paragraphId);
                }
            },
            {
                NAME: "image",
                PARAMETERS: [
                    {
                        NAME: "id",
                        TYPE: "string",
                    },
                    {
                        NAME: "width",
                        TYPE: "number",
                        MIN_VALUE: 20,
                        MAX_VALUE: 8000
                    }, {
                        NAME: "height",
                        TYPE: "number",
                        MIN_VALUE: 20,
                        MAX_VALUE: 8000
                    }
                ],
                VALIDATE: async (spaceId, resourceId, securityContext) => {
                    /*     const spaceModule = require('assistos').loadModule('space', securityContext);
                         const image = await spaceModule.getImageHead(spaceId, resourceId);
                         if (!image) {
                             throw ("Invalid image Id");
                         }*/
                }
            }
        ]
    }
}

