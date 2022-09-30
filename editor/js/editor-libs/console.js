import { writeOutput, formatOutput } from "./console-utils.js";

// Thanks in part to https://stackoverflow.com/questions/11403107/capturing-javascript-console-log
export default function (targetWindow) {
  /* Getting reference to console, either from current window or from the iframe window */
  var console = targetWindow ? targetWindow.console : window.console;

  var originalConsoleLogger = console.log; // eslint-disable-line no-console
  var originalConsoleError = console.error;

  console.error = function (loggedItem) {
    writeOutput(loggedItem);
    // do not swallow console.error
    originalConsoleError.apply(console, arguments);
  };

  // eslint-disable-next-line no-console
  console.log = function () {
    var formattedList = [];
    for (var i = 0, l = arguments.length; i < l; i++) {
      var formatted = formatOutput(arguments[i]);
      formattedList.push(formatted);
    }
    var output = formattedList.join(" ");
    writeOutput(output);
    // do not swallow console.log
    originalConsoleLogger.apply(console, arguments);
  };
}
