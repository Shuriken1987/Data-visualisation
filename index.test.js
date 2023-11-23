const {
  buildTree,
  addFile,
  data,
  editFile,
  deleteFile,
  updateTreeDisplay,
  setClicks,
  fileClicks,
} = require("./main.js");



describe("buildTree", () => {
  test("should create correct tree structure for given data", () => {
    const data = [
      "marvel/black_widow/bw.png",
      "marvel/drdoom/the-doctor.png",
      "dc/aquaman/mmmmmmomoa.png",
    ];

    const expectedTree = {
      marvel: {
        black_widow: { "bw.png": {} },
        drdoom: { "the-doctor.png": {} },
      },
      dc: {
        aquaman: { "mmmmmmomoa.png": {} },
      },
    };

    const tree = buildTree(data);
    expect(tree).toEqual(expectedTree);
  });

  test("should handle empty data array", () => {
    const data = [];
    const expectedTree = {};
    const tree = buildTree(data);
    expect(tree).toEqual(expectedTree);
  });

  test("should handle non-standard file paths", () => {
    const data = ["singlefile.txt", "folder/subfolder/file.png"];

    const expectedTree = {
      "singlefile.txt": {},
      folder: { subfolder: { "file.png": {} } },
    };

    const tree = buildTree(data);
    expect(tree).toEqual(expectedTree);
  });
});

describe("addFile", () => {
  // Mock global functions and variables
  global.alert = jest.fn();
  global.console.log = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    alert.mockClear();
    console.log.mockClear();

    // Set up our mock document
    document.body.innerHTML = '<input id="new-path" value="">';
  });

  test("should not add a path if input is empty", () => {
    document.getElementById("new-path").value = "";
    addFile();
    expect(alert).toHaveBeenCalledWith("No path provided.");
    expect(data).not.toContain("");
  });

  test("should add a new file path if it does not exist", () => {
    const newPath = "newFolder/newFile.txt";
    document.getElementById("new-path").value = newPath;
    addFile();
    expect(data).toContain(newPath);
    expect(alert).not.toHaveBeenCalled();
  });

  test("should not add a new directory path if it conflicts with existing paths", () => {
    const newPath = "dc/aquaman";
    document.getElementById("new-path").value = newPath;
    addFile();
    expect(alert).toHaveBeenCalledWith(
      "This path conflicts with an existing path."
    );
    expect(data).not.toContain(newPath);
  });
});


describe("deleteFile", () => {
  beforeEach(() => {
    // Set up our mock document
    document.body.innerHTML = `
      <div class="file">path1/file1.txt</div>
      <div class="file">path2/file2.txt</div>
      <div class="file">path3/file3.txt</div>
    `;
  });

  test("should remove the correct file element from the DOM", () => {
    const filePathToRemove = "path2/file2.txt";
    deleteFile(filePathToRemove);

    const filesAfterDeletion = document.querySelectorAll(".file");
    expect(filesAfterDeletion.length).toBe(2);
    filesAfterDeletion.forEach((file) => {
      expect(file.innerHTML).not.toBe(filePathToRemove);
    });
  });
});


describe("setClicks", () => {
  beforeEach(() => {
    // Set up our mock document with .file and .directory elements
    document.body.innerHTML = `
        <div class="directory">
          <ul style="display: none;">
            <li class="file">File 1</li>
            <li class="file">File 2</li>
          </ul>
        </div>
        <div class="directory">
          <ul style="display: none;">
            <li class="file">File 3</li>
            <li class="file">File 4</li>
          </ul>
        </div>
      `;
  });

  test("should toggle class and display style on click", () => {
    setClicks();

    // Simulate a click on the first directory
    const firstDirectory = document.querySelector(".directory");
    firstDirectory.click();

    expect(firstDirectory.classList).toContain("open");
    expect(firstDirectory.querySelector("ul").style.display).toBe("block");

    // Simulate another click to toggle back
    firstDirectory.click();

    expect(firstDirectory.classList).not.toContain("open");
    expect(firstDirectory.querySelector("ul").style.display).toBe("none");
  });
});

describe("fileClicks", () => {
  beforeEach(() => {
    // Set up our mock document with .file elements
    document.body.innerHTML = `
        <div class="file">File 1</div>
        <div class="file">File 2</div>
      `;
  });

  test("should stop click event propagation", () => {
    const files = document.querySelectorAll(".file");
    const mockCallback = jest.fn();

    // Attach the fileClicks functionality
    fileClicks(files);

    // Attach a click event listener to the document body to test event propagation
    document.body.addEventListener("click", mockCallback);

    // Simulate a click on the first file
    const firstFile = files[0];
    const event = new MouseEvent("click");
    firstFile.dispatchEvent(event);

    // Verify that the event did not propagate
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('editFile', () => {
  beforeEach(() => {
    global.prompt = jest.fn();
    global.console.error = jest.fn();
    global.alert = jest.fn();
    // Reset mocks before each test
    console.error.mockClear();
    alert.mockClear();
    prompt.mockClear();

    // Initialize data with some test paths
    data.length = 0; // Clear existing data
    data.push("path1/file1.txt", "path2/file2.txt", "path3/file3.txt");
  });

  test('should not edit a file if path not found', () => {
    const oldFilePath = "nonexistent.txt";
    editFile(oldFilePath);
    expect(console.error).toHaveBeenCalledWith("File path not found:", oldFilePath);
  });

  test('should not allow appending a path after the existing path', () => {
    const oldFilePath = "file2.txt";
    const appendedPath = "path2/file2.txt/newpath";
    prompt.mockReturnValue(appendedPath);
    editFile(oldFilePath);
    expect(alert).toHaveBeenCalledWith("Cannot append a new path after the existing file path:", oldFilePath);
  });
});

describe("updateTreeDisplay", () => {
  let treeContainer;

  beforeEach(() => {
    // Mock the treeContainer and tree data
    document.body.innerHTML = '<div id="tree-container"></div>';
    treeContainer = document.getElementById("tree-container");

    // Reset mocks before each test
    createTreeDom.mockClear();
    setClicks.mockClear();

    // Mock tree structure
    tree = {
      path1: {},
      path2: {},
    };

    // Mock createTreeDom and setClicks if they are not part of this test file
    // createTreeDom = jest.fn().mockReturnValue(document.createElement('div'));
    // setClicks = jest.fn();
  });

  test('should update treeContainer with new tree structure', () => {
    // Mock the return value of createTreeDom if needed
    const mockTreeDom = document.createElement('div');
    createTreeDom.mockReturnValue(mockTreeDom);

    updateTreeDisplay();

    // Check if createTreeDom was called with the tree
    expect(createTreeDom).toHaveBeenCalledWith(tree);

    // Check if the treeContainer's innerHTML is updated
    expect(treeContainer.innerHTML).toContain(mockTreeDom.outerHTML);

    // Check if setClicks was called
    expect(setClicks).toHaveBeenCalled();
  });

  test('should not update treeContainer if it does not exist', () => {
    // Remove treeContainer from DOM
    document.body.innerHTML = '';

    updateTreeDisplay();

    // Check if createTreeDom was not called as treeContainer does not exist
    expect(createTreeDom).not.toHaveBeenCalled();

    // Check if setClicks was not called as treeContainer does not exist
    expect(setClicks).not.toHaveBeenCalled();
  });

});


