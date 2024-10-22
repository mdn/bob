import { writeOutput, formatOutput } from "./console-utils.js";

// Thanks in part to https://stackoverflow.com/questions/11403107/capturing-javascript-console-log
export default function (targetWindow?: Window & typeof globalThis) {
  /* Getting reference to console, either from current window or from the iframe window */
  const console = targetWindow ? targetWindow.console : window.console;

  const originalConsoleLogger = console.log;
  const originalConsoleError = console.error;

  console.error = function (loggedItem: any, ...otherArgs: any[]) {
    writeOutput(loggedItem);
    // do not swallow console.error
    originalConsoleError.apply(console, [loggedItem, ...otherArgs]);
  };

  console.log = function (...args) {
    const formattedList = [];
    for (let i = 0, l = args.length; i < l; i++) {
      const formatted = formatOutput(args[i]);
      formattedList.push(formatted);
    }
    const output = formattedList.join(" ");
    writeOutput(output);
    // do not swallow console.log
    originalConsoleLogger.apply(console, args);
  };
}
