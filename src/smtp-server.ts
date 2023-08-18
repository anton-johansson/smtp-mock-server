import ms, {type MailServer} from "smtp-tester";
import {type HeaderValue} from "mailparser";

type Email = {
    readonly sender: string;
    readonly from: string;
    readonly to: string;
    readonly subject: string;
    readonly contentType: string;
    readonly bodyText: string;
    readonly bodyHTML: string;
};

export default class SMTPServer {
    private readonly _receivedEmails: Set<Email> = new Set();
    private server: MailServer;

    constructor(private readonly port: number) {}

    get receivedEmails(): Set<Email> {
        return this._receivedEmails;
    }

    start() {
        this.server = ms.init(this.port);
        this.server.bind((_, _2, email) => {
            const sender: string = email.sender;
            const from: string = extractStringFromHeader(email.headers.from);
            const to: string = extractStringFromHeader(email.headers.to);
            const subject: string = extractStringFromHeader(email.headers.subject);
            const contentType: string = extractStringFromHeader(email.headers["content-type"]);
            const bodyText: string = email.body;
            const bodyHTML: string = email.html || "";

            const data: Email = {
                sender,
                from,
                to,
                subject,
                contentType,
                bodyText,
                bodyHTML,
            };

            console.log("Received e-mail with subject", subject);
            this._receivedEmails.add(data);
        });

        console.log("SMTPServer is now listening on port", this.port);
    }

    stop() {
        console.log("Stopinng SMTPServer...");
        this.server.stop(() => {
            console.log("SMTPServer stopped!")
        });
    }
}

const extractStringFromHeader = (header: HeaderValue) => {
    if (typeof header === "string") {
        return header;
    }

    if (typeof header["value"] === "string") {
        return header["value"];
    }

    return "";
}