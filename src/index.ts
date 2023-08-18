#!/usr/bin/env node

import process from "process";
import {Command} from "commander";
import SMTPServer from "./smtp-server";
import API from "./api";

const options = new Command("smtp-mock-server")
    .option("-s, --smtp-port <port>", "The port that the SMTP server will listen on", "3025")
    .option("-a, --api-port <port>", "The port that the API server will listen on", "3080")
    .parse(process.argv)
    .opts();

const smtpPort = parseInt(options.smtpPort);
const apiPort = parseInt(options.apiPort);

const smtp = new SMTPServer(smtpPort);
smtp.start();

const api = new API(apiPort, smtp);
api.start();

const stop = (code: number) => {
    console.log(`${code} received...`);
    api.stop();
    smtp.stop();
};

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
