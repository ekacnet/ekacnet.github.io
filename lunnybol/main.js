'use strict';const COMMANDS={fb:{name:"Facebook",url:"https://facebook.com/",searchurl:"https://www.facebook.com/search/top/?q="},m:{name:"Messenger Desktop App",url:"messenger://"},mw:{name:"Messenger Web",url:"https://www.messenger.com/"},wa:{name:"WhatsApp Desktop App",url:"whatsapp://"},waw:{name:"WhatsApp Web",url:"https://web.whatsapp.com/"},gm:{name:"Gmail",url:"https://mail.google.com/mail/u/0",searchurl:"https://mail.google.com/mail/u/"},gd:{name:"Google Drive",url:"https://drive.google.com/drive/u/0",searchurl:"https://drive.google.com/drive/u/"},yt:{name:"YouTube",url:"https://youtube.com/",searchurl:"https://www.youtube.com/results?search_query="},gh:{name:"GitHub",url:"https://github.com/",searchurl:"https://www.github.com/search?q="},r:{name:"Reddit",url:"https://reddit.com/",searchurl:"https://www.reddit.com/search?q="},lk:{name:"Linkedin",url:"https://linkedin.com/",aliases:["linkedin"]},vs:{name:"VS Code",url:"vscode://"},cal:{name:"Google Calendar",url:"https://calendar.google.com/calendar/r"},we:{name:"Wikipedia",url:"https://en.wikipedia.org",searchurl:"https://en.wikipedia.org/wiki/"},hn:{name:"HackerNews Daily",url:"https://www.daemonology.net/hn-daily/"},DEFAULT:{name:"Default - Duck duck go Search",url:"https://duckduckgo.com/",searchurl:"https://www.duckduckgo.com/?q="}},viewHelpPage=function(){const a=Object.keys(COMMANDS).map(a=>{const b=COMMANDS[a];return{name:b.name,url:b.url,command:a,aliases:(b.aliases||[""]).join(", "),searchurl:b.searchurl||""}});$("#help-table").DataTable({data:a,columns:[{data:"command",title:"Command"},{data:"name",title:"Name"},{data:"url",title:"URL"},{data:"searchurl",title:"SearchURL"},{data:"aliases",title:"Aliases"}],order:[[1,"asc"]],paging:!1})},redirect=async function(a){await window.location.replace(a)},parsecommands=function(a){var b={};for(var c of Object.keys(a)){var d=a[c],e={name:d.name,url:d.url,searchurl:d.searchurl,otherNames:d.aliases};if(b[c]=e,d.aliases&&d.aliases.length)for(var f of d.aliases){var g=d.aliases.filter(a=>a!=f),e={name:d.name,url:d.url,searchurl:d.searchurl,otherNames:g.concat([c])};b[f]=e}}return console.log(b),b},bunnylol=async function(a){let b=[];if(a.startsWith("$")?(b=a.split(/[ $+]/g),b[0]="$",""===b[1]&&(b=["$"])):b=a.split(/[ +]/g),0<b.length){const c=b[0].endsWith(".")?b[0].substring(0,b[0].length-1).toLowerCase():b[0].toLowerCase();if(c in parsedCommands){const d=parsedCommands[c],e=new URL(d.url).protocol;if(d.searchurl&&1!==b.length){const b="$"===c?c.length:c.length+1;return await redirect(`${d.searchurl}${encodeURIComponent(a.substr(b))}`),!0}return await redirect(d.url),!0}}return!1},parsedCommands=parsecommands(COMMANDS),currCmd=new URL(window.location.href).searchParams.get("search")??"help";switch(currCmd){case"help":viewHelpPage();break;default:bunnylol(currCmd).then(a=>{!a&&parsedCommands.DEFAULT.searchurl&&redirect(`${parsedCommands.DEFAULT.searchurl}${encodeURIComponent(currCmd)}`)}).catch(a=>{console.log(a)});}