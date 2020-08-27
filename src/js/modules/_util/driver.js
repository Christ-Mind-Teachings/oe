import Driver from "driver.js";

export function pageDriver() {
  const driver = new Driver({
    allowClose: false,
    opacity: 0.5
  });

  let steps = [
    {
      element: "#source-homepage",
      popover: {
        title: "Title",
        description: "This is the homepage for <em>A Course in Miracles Original Edition</em>.<br><br>Click on an image below to see the table of contents.",
        position: "bottom"
      }
    },
    {
      element: "#book-acq",
      popover: {
        title: "Get Acquainted",
        description: "Get help and learn about ACIM Original Edition",
        position: "right"
      }
    },
    {
      element: "#book-text",
      popover: {
        title: "Text",
        description: "The Text of ACIM containing thirty one chapters",
        position: "left"
      }
    },
    {
      element: "#book-workbook",
      popover: {
        title: "Workbook for Students",
        description: "The Workbook for Students containing one lesson for each day of the year.",
        position: "right"
      }
    },
    {
      element: "#book-manual",
      popover: {
        title: "Manual for Teachers",
        description: "Answers common questions and clarifies terms used in ACIM.",
        position: "left"
      }
    }
  ];

  driver.defineSteps(steps);
  driver.start();
}

