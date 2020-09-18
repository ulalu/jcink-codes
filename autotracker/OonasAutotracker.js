  const unusedForums = irrelevantForums.map((item) => item.toLowerCase());
  const closedForums = closedThreadForums.map((item) => item.toLowerCase());

  for (i = 0; i < characterNames.length; i++) {
    const kebabCharacter = characterNames[i].split(" ").join("-");
    const thisCharacterDiv = document.getElementById(kebabCharacter);
    const thisCharacter = characterNames[i];
    const owedThreadDiv = $("<div class='thread-list'></div>");
    const unowedThreadDiv = $("<div class='thread-list'></div>");
    const closedThreadDiv = $("<div class='thread-list'></div>");

    const buildTrackerDivs = function () {
      $(thisCharacterDiv).append(owedThreadDiv, unowedThreadDiv, closedThreadDiv);
      owedThreadDiv.append(`<p class="thread-title">${thisCharacter}'s Owed Threads</h1>`);
      unowedThreadDiv.append(`<p class="thread-title">${thisCharacter}'s Unowed Threads</h1>`);
      closedThreadDiv.append(`<p class="thread-title">${thisCharacter}'s Closed Threads</h1>`);
    };

    const processCharacterThreads = async (character) => {
      const initialSearchURL = `/index.php?act=Search&q=&f=&u=${character.replace(" ", "%20")}&rt=topics`;
      let searchReturn;
      try {
        const initialSearchData = await $.get(initialSearchURL);
        let searchReturnBody = new DOMParser().parseFromString(initialSearchData, "text/html");
        let searchInitReturn = $('meta[http-equiv="refresh"]', searchReturnBody);
        if (searchInitReturn.length) {
          const finalSearchURL = searchInitReturn.attr("content").substr(searchInitReturn.attr("content").indexOf("=") + 1);
          let finalSearchData;
          try {
            finalSearchData = await $.get(finalSearchURL);
          } catch (error) {
            owedThreadDiv.append('<div class="thread">Search Failed, this is likely an error with jcink. Refresh the page.</div>');
            return;
          }
          searchReturn = new DOMParser().parseFromString(finalSearchData, "text/html");
        } else {
          owedThreadDiv.append(`<div class="thread">This search failed. Does your character have posts in the tracked forum?</div>`);
          return;
        }
      } catch (error) {
        owedThreadDiv.append('<div class="thread">Search Failed, this is likely an error with jcink. Refresh the page.</div>');
        return;
      }

      $("#search-topics .tablebasic > tbody > tr", searchReturn).each((row, e) => {
        if (row > 0) {
          let cells = $(e).children("td");
          const forum = $(cells[3]).text().toLowerCase();
          const title = $(cells[2]).find("td:nth-child(2) > a").text();
          const characterName = thisCharacter.toLowerCase().split(" ")[0]

          if (!unusedForums.includes(forum) && !title.toLowerCase()includes(characterName)) {
            const threadDesc = $(cells[2]).find(".desc").text();
            const threadUrl = $(cells[7]).children("a").attr("href");
            const lastPoster = $(cells[7]).children("b").text();
            const myTurn = lastPoster.includes(thisCharacter) ? "unowed" : "owed";

            let postDate = $(cells[7]).html();
            postDate = postDate.substr(0, postDate.indexOf("<"));
            postDate.includes(",") ? (postDate = postDate.substring(0, postDate.indexOf(","))) : null;

            if (closedForums.includes(forum)) {
              closedThreadDiv.append($(`<div class="thread"><span class="closed">o</span> <a href="${threadUrl}">${title}</a><br/> ${threadDesc}</div>`));
            } else if (myTurn == "owed") {
              owedThreadDiv.append($(`<div class="thread"><span class="${myTurn}">-</span> <a href="${threadUrl}">${title}</a><br/> ${threadDesc} <br/> Last Post: ${lastPoster} <br/><span class="date">${postDate}</span></div>`));
            } else {
              unowedThreadDiv.append($(`<div class="thread"><span class="${myTurn}">+</span> <a href="${threadUrl}">${title}</a><br/>${threadDesc} <br/> Last Post: ${lastPoster} <br/><span class="date">${postDate}</span></div>`));
            }
          }
        }
      });
      owedThreadDiv.has("div").length ? null : owedThreadDiv.append('<div class="thread empty">None, good work!</div>');
      unowedThreadDiv.has("div").length ? null : unowedThreadDiv.append('<div class="thread empty">Wow, look at you all caught up!</div>');
      closedThreadDiv.has("div").length ? null : closedThreadDiv.append(`<div class="thread empty">You'll finish one someday.</div>`);
    }

    buildTrackerDivs();

    setTimeout(() => {
      processCharacterThreads(thisCharacter);
    }, i*10000);
  }

