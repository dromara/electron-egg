#!/usr/bin/env node
import { program } from "commander";
import { move } from "./tools/move";
import { encrypt, cleanEncrypt } from "./tools/encrypt";
import { serveProcess } from "./tools/serve";
import { incrUpdater } from "./tools/incrUpdater";
program.command("dev").description("create frontend-serve and electron-serve").option("--config <folder>", "config file").option("--serve <mode>", "serve mode").action(function() {
  serveProcess.dev(this.opts());
});
program.command("build").description("building multiple resources").option("--config <folder>", "config file").option("--cmds <flag>", "custom commands").option("--env <env>", "environment").action(function() {
  serveProcess.build(this.opts());
});
program.command("start").description("preview effect").option("--config <folder>", "config file").action(function() {
  serveProcess.start(this.opts());
});
program.command("exec").description("create frontend-serve and electron-serve").option("--config <folder>", "config file").option("--cmds <flag>", "custom commands").action(function() {
  serveProcess.exec(this.opts());
});
program.command("move").description("Move multip resources").option("--config <folder>", "config file").option("--flag <flag>", "Custom flag").action(function() {
  move(this.opts());
});
program.command("encrypt").description("Code encryption").option("--config <folder>", "config file").option("--out <folder>", "output directory").action(function() {
  encrypt(this.opts());
});
program.command("clean").description("Clear the encrypted code").option("-d, --dir <folder>", "clean directory").action(function() {
  cleanEncrypt(this.opts());
});
program.command("updater").description("updater commands").option("--config <folder>", "config file").option("--asar-file <file>", "asar file path").option("--platform <flag>", "platform").option("--force <flag>", "force update full").action(function() {
  incrUpdater.run(this.opts());
});
program.parse();
