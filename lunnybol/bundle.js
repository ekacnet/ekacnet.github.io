'use strict';// CommandTypeUnormalized is pretty much like CommandType but
// we don't want them to be mixed
// Type for the Data table containing the commands
// Type for the header to display the commands
const COMMANDS = {
  fb: {
    name: "Facebook",
    url: "https://facebook.com/",
    searchurl: "https://www.facebook.com/search/top/?q="
  },
  m: {
    name: "Messenger Desktop App",
    url: "messenger://"
  },
  mw: {
    name: "Messenger Web",
    url: "https://www.messenger.com/"
  },
  wa: {
    name: "WhatsApp Desktop App",
    url: "whatsapp://"
  },
  waw: {
    name: "WhatsApp Web",
    url: "https://web.whatsapp.com/"
  },
  gm: {
    name: "Gmail",
    url: "https://mail.google.com/mail/u/0",
    searchurl: "https://mail.google.com/mail/u/"
  },
  gd: {
    name: "Google Drive",
    url: "https://drive.google.com/drive/u/0",
    searchurl: "https://drive.google.com/drive/u/"
  },
  yt: {
    name: "YouTube",
    url: "https://youtube.com/",
    searchurl: "https://www.youtube.com/results?search_query="
  },
  gh: {
    name: "GitHub",
    url: "https://github.com/",
    searchurl: "https://www.github.com/search?q="
  },
  r: {
    name: "Reddit",
    url: "https://reddit.com/",
    searchurl: "https://www.reddit.com/search?q="
  },
  lk: {
    name: "Linkedin",
    url: "https://linkedin.com/",
    aliases: ["linkedin"]
  },
  vs: {
    name: "VS Code",
    url: "vscode://"
  },
  cal: {
    name: "Google Calendar",
    url: "https://calendar.google.com/calendar/r"
  },
  we: {
    name: "Wikipedia",
    url: "https://en.wikipedia.org",
    searchurl: "https://en.wikipedia.org/wiki/"
  },
  hn: {
    name: "HackerNews Daily",
    url: "https://www.daemonology.net/hn-daily/"
  },
  DEFAULT: {
    name: "Default - Duck duck go Search",
    url: "https://duckduckgo.com/",
    searchurl: "https://www.duckduckgo.com/?q="
  }
};const viewHelpPage = function () {
  const data = Object.keys(COMMANDS).map(command => {
    const cmdData = COMMANDS[command];
    return {
      name: cmdData.name,
      url: cmdData.url,
      command: command,
      aliases: (cmdData.aliases || [""]).join(', '),
      searchurl: cmdData.searchurl || ""
    };
  });
  const columns = [{
    data: 'command',
    title: "Command"
  }, {
    data: 'name',
    title: "Name"
  }, {
    data: 'url',
    title: "URL"
  }, {
    data: 'searchurl',
    title: "SearchURL"
  }, {
    data: 'aliases',
    title: "Aliases"
  }]; // $FlowFixMe - jQuery import

  $('#help-table').DataTable({
    data: data,
    columns: columns,
    order: [[1, "asc"]],
    paging: false
  });
  /*    const classesData: Array<CommandDataTableHeaderType> = Object.keys(CLASSES).map((command: ClassCommands) => {
          const cmdData = CLASSES[command];
          return {
              name: cmdData.name, 
              url: cmdData.url, 
              // $FlowFixMe - this is actually correct.
              command
          };
      });
  
      const classColumns: Array<ColumnDataTableType> = [
          {data: 'command', title: "Command"}, 
          {data: 'name', title: "Name"}, 
          {data: 'url', title: "URL"}, 
      ];
      // $FlowFixMe - jQuery import
      $('#classes-table').DataTable({
          data: classesData,
          columns: classColumns,
          order: [[ 1, "asc" ]],
          paging: false
      });
  */
};//import type { ClassCommands, JoinOrDiscussType, ClassType } from "./classes.js";

const redirect = async function (url) {
  await window.location.replace(url);
};

const parsecommands = function (inCommands) {
  var ret = {};

  for (var key of Object.keys(inCommands)) {
    var val = inCommands[key];
    var newVal = {
      name: val.name,
      url: val.url,
      searchurl: val.searchurl,
      otherNames: val.aliases
    };
    ret[key] = newVal;

    if (val.aliases && val.aliases.length) {
      for (var altKey of val.aliases) {
        var others = val.aliases.filter(elem => elem != altKey);
        var newVal = {
          name: val.name,
          url: val.url,
          searchurl: val.searchurl,
          otherNames: others.concat([key])
        };
        ret[altKey] = newVal;
      }
    }
  }

  console.log(ret);
  return ret;
};

const bunnylol = async function (currCmd) {
  let arr = []; // split the current command on spaces and '$' if it starts with a '$'

  if (currCmd.startsWith("$")) {
    arr = currCmd.split(/[ $+]/g);
    arr[0] = "$";

    if (arr[1] === "") {
      arr = ["$"];
    }
  } else {
    arr = currCmd.split(/[ +]/g);
  }

  if (arr.length > 0) {
    // Ignore the '.' at the end of the command
    const prefix = arr[0].endsWith(".") ? arr[0].substring(0, arr[0].length - 1).toLowerCase() : arr[0].toLowerCase();
    /*    if (prefix in CLASSES) {
          // $FlowFixMe - this is actually correct since the prefix is a key.
          const classData: ClassType = CLASSES[prefix];
          if (arr.length > 1) {
            if (arr[1].toLowerCase() === "j" && classData.zoomurl) {
              await redirect(`${classData.zoomurl}`);
              return true;
            } else if (arr[1].toLowerCase() === "d" && classData.discussionurl) {
              await redirect(`${classData.discussionurl}`);
              return true;
            } else if (arr[1].toLowerCase() === "c" && classData.collaburl) {
              await redirect(`${classData.collaburl}`);
              return true;
            } else if (arr[1].toLowerCase() === "s" && classData.specialurl) {
              await redirect(`${classData.specialurl}`);
              return true;
            }
          }
          await redirect(`${classData.url}`);
          return true;
        }
    */

    if (prefix in parsedCommands) {
      // $FlowFixMe - this is actually correct since the prefix is a key.
      const command = parsedCommands[prefix];
      const protocol = new URL(command.url).protocol; //if (protocol !== "https:" && protocol !== "http:") {
      //  viewHelpPage();
      //}

      if (command.searchurl && arr.length !== 1) {
        const searchParam = prefix !== "$" ? prefix.length + 1 : prefix.length;
        await redirect(`${command.searchurl}${encodeURIComponent(currCmd.substr(searchParam))}`);
        return true;
      } else {
        await redirect(command.url);
        return true;
      }
    }
  }

  return false;
};

const parsedCommands = parsecommands(COMMANDS);
const currCmd = new URL(window.location.href).searchParams.get("search") ?? "help";

switch (currCmd) {
  case "help" :
    viewHelpPage();
    break;

  default:
    bunnylol(currCmd).then(done => {
      if (!done && parsedCommands.DEFAULT.searchurl) {
        redirect(`${parsedCommands.DEFAULT.searchurl}${encodeURIComponent(currCmd)}`);
      }
    }).catch(reject => {
      console.log(reject);
    });
    break;
}