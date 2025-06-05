class ServerSideSecurityContext{
    constructor(request) {
        this.cookies = request.headers.cookie;
    }

}
module.exports = ServerSideSecurityContext;