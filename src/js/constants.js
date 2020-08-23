/*
  Teaching specific data
*/

const keyInfo = require("./modules/_config/key");
import {getPageInfo} from "./modules/_config/config";

export default {
  sid: "oe",
  lang: "en",
  env: "integration",
  url_prefix: "/t/acimoe",
  sourceId: 15,
  quoteManagerId: "05399539cca9ac38db6db36f5c770ff1",
  quoteManagerName: "CMI",
  getPageInfo: getPageInfo,            //list
  keyInfo: keyInfo,                    //list, bmnet
  store: {
    bmList: "bm.list",
    bmCreation: "bm.creation",
    bmTopics: "bm.topics",
    bmModal: "bm.modal",
    srchResults: "srch.results",
    srchtextflat: "srch.text.flat",
    srchworkbookflat: "srch.workbook.flat",
    srchmanualflat: "srch.manual.flat",
    pnDisplay: "pn.display",
    cfgacq: "cfg.acq",
    cfgtext: "cfg.text",
    cfgworkbook: "cfg.workbook",
    cfgmanual: "cfg.manual"
  }
};
