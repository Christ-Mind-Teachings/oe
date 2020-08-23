import scroll from "scroll-into-view";
import {getConfig} from "../_config/config";

const uiTocModal = ".toc.ui.modal";
const uiOpenTocModal = ".toc-modal-open";
const uiModalOpacity = 0.5;

/*
  generate html for acim text sections
  data-secid used to simplify calculating next and previous sections
*/
function renderSections(base, sections, cidx) {
  return `
    <div id="c${cidx}" data-sections="${sections.length}" class="list">
      ${sections.map((q, qidx) => `
        <a data-secid="${qidx}" class="item${getTimerClass(q)}"
          href="${base}${q.url}">${q.ref?q.ref+" ":""}${q.title}
        </a>
      `).join("")}
    </div>
  `;
}

//generate html for Contents
function makeContents(contents) {
  return (`
    <div class="ui ordered relaxed list">
      ${contents.map(unit => `
        <div class="item">
          <a href="${unit.url}">${unit.title}</a>
        </div>
      `).join("")}
    </div>
  `);
}

/*
 * generate html for Text contents
 * - pass cidx-2 to renderSection because of Forward & Introduction are not chapters
 *   but come first in config
 */
function makeTextContents(contents) {
  return (`
    <div class="ui relaxed list">
      ${contents.map((unit, cidx) => `
        <div class="item">
          <div class="header">${unit.id ? `${unit.id}: `:""}${unit.title}</div>
          ${unit.sections ? renderSections(unit.base, unit.sections, cidx) : "" }
        </div>
      `).join("")}
    </div>
  `);
}

/*
  generate html for acim workbook pages
  data-secid used to simplify calculating next and previous sections
*/
function renderWorkbookPage(base, pages, pidx, sidx, lesson) {
  return `
    <div id="${pidx + 1}.${sidx + 1}" data-sections="${pages.length}" class="list">
      ${pages.map((p) => `<a data-lid="${++lesson.count}" class="item${getTimerClass(p)}" href="${base}${p.url}">${p.lesson?p.lesson+". ":""}${p.title}</a>`).join("")}
    </div>
  `;
}

/*
  generate html for acim workbook sections
*/
function renderWorkbookSection(sections, pidx, lesson) {
  return (`
    <div class="list">
      ${sections.map((section, sidx) => `
        <div class="item">
          <div class="header">${section.title}</div>
          ${section.page ? renderWorkbookPage(section.base, section.page, pidx, sidx, lesson) : "" }
        </div>
      `).join("")}
    </div>
  `);
}

/*
  generate toc html for Workbook
  Workbook is organized in part > section > pages
*/
function makeWorkbookContents(contents) {
  var lesson = {count: 0};
  return (`
    <div class="ui relaxed list">
      ${contents.map((content, pidx) => `
        <div class="item">
          <div class="content">
            ${content.section ? renderWorkbookSection(content.section, pidx, lesson) : "" }
          </div>
        </div>
      `).join("")}
    </div>
  `);
}

/*
* If there is timing or a timer defined for a toc item
* set the class accordingly. A clock icon is displayed
* info.timing, a user icon when info.timer and no icon
* otherwise.
*
* June 1, 2020: disable display of icons, all timing is
* complete so we don't need them anymore.
*/
function getTimerClass(info) {
  return "";
  if (info.timing) {
    return " __timing";
  }
  if (info.timer) {
    return " __timer";
  }
  return "";
}

/*
  generate toc html for Manual
  Manual is organized in pages
*/
function makeManualContents(base, pages) {
  return (`
    <div class="ui relaxed list">
      ${pages.map((page, pidx) => `
        <a data-lid="${pidx+1}" class="item${getTimerClass(page)}" href="${base}${page.url}">${pidx > 0?pidx+". " :""}${page.title}</a>`).join("")}
    </div>
  `);
}

/*
  Attributes on the table of contents, id, data-secid, and data-sections, are used
  to determine the next and previous pages and to update the "arrow" controls on the
  menu bar.

  See renderSections() for how attributes are assigned
 */
function textnp($el) {
  let section = parseInt($el.attr("data-secid"), 10);
  let chapId = $el.parent().attr("id");
  let chapter = parseInt(chapId.substring(1), 10);
  let numberOfSections = parseInt($(`#${chapId}`).attr("data-sections"), 10);

  let nextChapter = chapter;
  let nextSection = section;
  let prevChapter = chapter;
  let prevSection = section;

  //** find next section **
  //check if we're at the last section of the chapter
  if (section === numberOfSections - 1) {
    nextChapter = chapter < 31 ? chapter + 1: -1;
    nextSection = 0;
  }
  else {
    nextSection = nextSection + 1;
  }

  //** find prev section */
  if (section === 0) {
    if (chapter > 0) {
      prevChapter = chapter - 1;
      prevSection = parseInt($(`#c${prevChapter}`).attr("data-sections"), 10) - 1;
    }
    else {
      //we can't go back any further
      prevChapter = -1;
      prevSection = -1;
    }
  }
  else {
    prevSection = section - 1;
  }

  // console.log("chapId: %s, chapter: %s, section: %s, numberOfSections: %s", chapId, chapter, section,  numberOfSections);
  // console.log("nextChapter: %s, nextSection: %s", nextChapter, nextSection);
  // console.log("prevChapter: %s, prevSection: %s", prevChapter, prevSection);

  //set the next control on the page
  //disable 'next-page'
  if (nextChapter === -1) {
    $("#toc-next-page").addClass("disabled");
  }
  else {
    //incase the control has been disabled
    $("#toc-next-page").removeClass("disabled");

    let nextHref = $(`#c${nextChapter} a[data-secid="${nextSection}"]`).attr("href");
    let nextText = $(`#c${nextChapter} a[data-secid="${nextSection}"]`).text();

    //set next tooltip and href
    $("#toc-next-page > span").attr("data-tooltip", `${nextText}`);
    $("#toc-next-page").attr("href", `${nextHref}`);
  }

  //disable 'prev-page'
  if (prevChapter === -1) {
    $("#toc-previous-page").addClass("disabled");
  }
  else {
    //incase the control has been disabled
    $("#toc-previous-page").removeClass("disabled");

    let prevHref = $(`#c${prevChapter} a[data-secid="${prevSection}"]`).attr("href");
    let prevText = $(`#c${prevChapter} a[data-secid="${prevSection}"]`).text();

    //set prev tooltip and href
    $("#toc-previous-page > span").attr("data-tooltip", `${prevText}`);
    $("#toc-previous-page").attr("href", `${prevHref}`);
  }
}

/*
  set next/prev controls on menu for workbook transcripts
*/
function workbookNextPrev($el) {
  const LAST_ID = 390;
  let prevId = -1, nextId = -1, href, text;
  let lid = $el.attr("data-lid");
  let lessonId = parseInt(lid, 10);

  //disable prev control
  if (lessonId === 1) {
    $("#toc-previous-page").addClass("disabled");
  }
  else {
    $("#toc-previous-page").removeClass("disabled");
    prevId = lessonId - 1;
  }

  //disable next control
  if (lessonId === LAST_ID) {
    $("#toc-next-page").addClass("disabled");
  }
  else {
    $("#toc-next-page").removeClass("disabled");
    nextId = lessonId + 1;
  }

  if (prevId > -1) {
    href = $(`a[data-lid="${prevId}"]`).attr("href");
    text = $(`a[data-lid="${prevId}"]`).text();

    //set prev tooltip and href
    $("#toc-previous-page > span").attr("data-tooltip", `${text}`);
    $("#toc-previous-page").attr("href", `${href}`);
  }

  if (nextId > -1) {
    href = $(`a[data-lid="${nextId}"]`).attr("href");
    text = $(`a[data-lid="${nextId}"]`).text();

    //set prev tooltip and href
    $("#toc-next-page > span").attr("data-tooltip", `${text}`);
    $("#toc-next-page").attr("href", `${href}`);
  }
}

/*
  set next/prev controls on menu for workbook transcripts
*/
function manualNextPrev($el, unitMax) {
  const LAST_ID = unitMax;
  let prevId = -1, nextId = -1, href, text;
  let lid = $el.attr("data-lid");
  let lessonId = parseInt(lid, 10);

  //disable prev control
  if (lessonId === 1) {
    $("#toc-previous-page").addClass("disabled");
  }
  else {
    $("#toc-previous-page").removeClass("disabled");
    prevId = lessonId - 1;
  }

  //disable next control
  if (lessonId === LAST_ID) {
    $("#toc-next-page").addClass("disabled");
  }
  else {
    $("#toc-next-page").removeClass("disabled");
    nextId = lessonId + 1;
  }

  if (prevId > -1) {
    href = $(`a[data-lid="${prevId}"]`).attr("href");
    text = $(`a[data-lid="${prevId}"]`).text();

    //set prev tooltip and href
    $("#toc-previous-page > span").attr("data-tooltip", `${text}`);
    $("#toc-previous-page").attr("href", `${href}`);
  }

  if (nextId > -1) {
    href = $(`a[data-lid="${nextId}"]`).attr("href");
    text = $(`a[data-lid="${nextId}"]`).text();

    //set prev tooltip and href
    $("#toc-next-page > span").attr("data-tooltip", `${text}`);
    $("#toc-next-page").attr("href", `${href}`);
  }
}

/*
  If we're on a transcript page, highlight the
  current transcript in the list and calc prev and next
  links

  Args:
    bid: bookId, 'text', 'workbook', 'manual'
*/
function highlightCurrentTranscript(bid, setNextPrev = true) {
  if ($(".transcript").length > 0) {
    let page = location.pathname;
    let $el = $(`.toc-list a[href='${page}']`);

    //remove href to deactivate link for current page
    $el.addClass("current-unit").removeAttr("href");

    if (!setNextPrev) {
      return;
    }

    //set prev/next menu links
    switch(bid) {
      case "text":
        textnp($el);
        break;
      case "workbook":
        workbookNextPrev($el);
        break;
      case "manual":
        manualNextPrev($el, 30);
        break;
      case "acq":
        manualNextPrev($el, 6);
        break;
    }
  }
}

/*
  Loads TOC for current transcript page, marks current page in toc, and sets
  next/prev menu links

  On pages where the toc is created for items other than the menu toc the toc may need to be
  reset, this is done by checking for toc.init === true. To work correctly, page elements with
  .toc-modal-open must also have .combined, otherwise the toc will get messed up.
*/
function loadTOC(toc) {

  //check if previously initialized
  if (toc.init) {
    //toc refresh not needed if not combined
    if (!toc.combined) {
      return;
    }

    //console.log("toc previously initialized, toc: %o", toc);
    $(".toc-image").attr("src", `${toc.image}`);
    $(".toc-title").html(`Table of Contents: <em>${toc.title}</em>`);
    $(".toc-list").html(toc.html);

    //set current-item, don't setNextPrev since it was already done.
    highlightCurrentTranscript(toc.bid, false);

    return;
  }

  let book = $("#contents-modal-open").attr("data-book").toLowerCase();
  toc.book = book;

  getConfig(book)
    .then((contents) => {
      var html;

      $(".toc-image").attr("src", `${contents.image}`);
      $(".toc-title").html(`<em>${contents.title}</em>`);
      toc["image"] = contents.image;
      toc["title"] = contents.title;
      toc["bid"] = contents.bid;

      switch(contents.bid) {
        case "text":
          html = makeTextContents(contents.contents);
          break;
        case "workbook":
          html = makeWorkbookContents(contents.contents);
          //$(".toc-list").html(makeWorkbookContents(contents.contents));
          break;
        case "manual":
        case "acq":
          html = makeManualContents(contents.base, contents.contents);
          //$(".toc-list").html(makeManualContents(contents.base, contents.contents));
          break;
        case "raj":
          html = makeRajContents(contents.contents);
          break;
        default:
          html = makeContents(contents.contents);
          //$(".toc-list").html(makeContents(contents.contents));
          break;
      }
      toc.html = html;
      toc.init = true;
      $(".toc-list").html(html);
      highlightCurrentTranscript(contents.bid);

      /*
      let page = location.pathname;
      let $el = $(`.toc-list a[href='${page}']`);

      console.log("toc pathname: %s", page);
      console.log("toc current-item class: %s", $el.attr("class"));
      console.log("toc current-item href: %s", $el.attr("href"));
      */
    })
    .catch((error) => {
      console.error(error);
      $(".toc-image").attr("src", "/public/img/cmi/toc_modal.png");
      $(".toc-title").html("Table of Contents: <em>Error</em>");
      $(".toc-list").html(`<p>Error: ${error.message}</p>`);
      $(uiTocModal).modal("show");
    });
}

/*
  Calls to this function are valid for transcript pages.
*/
export function getBookId() {
  return $(uiOpenTocModal).attr("data-book");
}

export default {

  /*
   * Init the modal dialog with data from JSON file
   * or local storage
   */
  initialize: function(env) {
    let toc = {init: false, book: "", html: ""};

    //modal dialog settings
    $(uiTocModal).modal({
      dimmerSettings: {opacity: uiModalOpacity},
      observeChanges: true,
      onVisible: function() {
        let $el = $(".toc-list a.current-unit");
        scroll($el.get(0), {
          isScrollable: function(target, defaultIsScrollable) {
            return defaultIsScrollable(target) || target.className.includes('scrolling');
          }
        });
      }
    });

    //load toc once for transcript pages
    if (env === "transcript") {
      loadTOC(toc);
    }

    /*
     * TOC populated by JSON file from AJAX call if not found
     * in local storage.
     *
     * Read value of data-book attribute to identify name of file
     * with contents.
     */
    $(uiOpenTocModal).on("click", (e) => {
      e.preventDefault();
      let book = $(e.currentTarget).attr("data-book").toLowerCase();
      let combined = $(e.currentTarget).hasClass("combined");

      //load the TOC if we're not on a transcript page
      if (env !== "transcript" || (env === "transcript" && combined)) {
        getConfig(book)
          .then((contents) => {
            $(".toc-image").attr("src", `${contents.image}`);
            $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);

            //mark toc as combined
            if (env === "transcript" && combined) {
              toc["combined"] = true;
            }

            switch(contents.bid) {
              case "text":
                $(".toc-list").html(makeTextContents(contents.contents));
                break;
              case "workbook":
                $(".toc-list").html(makeWorkbookContents(contents.contents));
                break;
              case "manual":
              case "acq":
                $(".toc-list").html(makeManualContents(contents.base, contents.contents));
                break;
              case "raj":
                $(".toc-list").html(makeRajContents(contents.contents));
                break;
              default:
                $(".toc-list").html(makeContents(contents.contents));
                break;
            }

            $(uiTocModal).modal("show");
          })
          .catch((error) => {
            console.error(error);
            $(".toc-image").attr("src", "/public/img/cmi/toc_modal.png");
            $(".toc-title").html("Table of Contents: <em>Error</em>");
            $(".toc-list").html(`<p>Error: ${error.message}</p>`);
            $(uiTocModal).modal("show");
          });
      }
      //transcript and not combined
      else {
        loadTOC(toc);
        $(uiTocModal).modal("show");
      }
    });
  }
};
