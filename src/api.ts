import fastify, {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import SMTPServer from "./smtp-server";

type AwaitEmailParams = {
    subject: string | undefined;
    timeout: number | undefined;
    remove: boolean | undefined;
};

type TimeoutIds = {
    timeoutId: NodeJS.Timeout | null;
    intervalId: NodeJS.Timeout | null;
};

export default class API {
    private server: FastifyInstance;

    constructor(private readonly port: number, private readonly smtp: SMTPServer) {}

    start() {
        this.server = fastify();
        this.server.get("/", this.root.bind(this))
        this.server.post("/clear-emails", this.clearEmails.bind(this));
        this.server.get("/await-email", this.awaitEmail.bind(this));
        this.server.listen({port: this.port}, (err, address) => {
            if (err) {
                throw err;
            }

            console.log(`API is now listening on ${address}`);
        });
    }

    stop() {
        console.log("Stopinng API...");
        this.server.close(() => {
            console.log("API stopped!")
        });
    }

    private async root(_: FastifyRequest, reply: FastifyReply) {
        reply.code(200);
    }

    private async clearEmails(_: FastifyRequest, reply: FastifyReply) {
        console.log("Clearing emails...");
        this.smtp.receivedEmails.clear();
        reply.code(200);
    }

    private async awaitEmail(request: FastifyRequest, reply: FastifyReply) {
        console.log("Awaiting email...");
        const params: AwaitEmailParams = request.query as AwaitEmailParams;
        const timeout = params.timeout ?? 5_000;
        const subject = params.subject ?? null;
        const remove = params.remove ?? true;

        try {
            const email = await new Promise((resolve, reject) => {
                const timeouts: TimeoutIds = {
                    timeoutId: null,
                    intervalId: null,
                };

                timeouts.timeoutId = setTimeout(() => {
                    if (timeouts.intervalId) {
                        clearInterval(timeouts.intervalId);
                    }

                    reject(new Error("Timeout waiting for e-mail"));
                }, timeout);

                timeouts.intervalId = setInterval(() => {
                    const email = Array.from(this.smtp.receivedEmails).find(email => {
                        if (subject !== null && subject !== email.subject) {
                            return false;
                        }

                        return true;
                    });

                    if (email) {
                        if (timeouts.intervalId) {
                            clearInterval(timeouts.intervalId);
                        }

                        if (timeouts.timeoutId) {
                            clearTimeout(timeouts.timeoutId);
                        }

                        if (remove) {
                            this.smtp.receivedEmails.delete(email);
                        }

                        resolve(email);
                    }
                }, 100);
            });

            reply.code(200);
            reply.send(email);
        } catch (error: any) {
            reply.code(400);
            reply.send({
                message: error.message ?? "Unknown error",
            });
        }
    }
}