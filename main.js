let data = [
  "marvel/black_widow/bw.png",
  "marvel/drdoom/the-doctor.png",
  "fact_marvel_beats_dc.txt",
  "dc/aquaman/mmmmmmomoa.png",
  "marvel/black_widow/why-the-widow-is-awesome.txt",
  "dc/aquaman/movie-review-collection.txt",
  "marvel/marvel_logo.png",
  "dc/character_list.txt",
];
// Retrieve a container element from the DOM where the data tree will be displayed.
const treeContainer = document.getElementById("data-tree");

// Build and display the initial tree structure based on the data.
let tree = buildTree(data);
updateTreeDisplay();

// This function constructs a hierarchical tree structure from a array of file paths.
function buildTree(data) {
  let tree = {};
  data.forEach((path) => {
    let parts = path.split("/");
    let current = tree;
    for (let part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  });
  return tree;
}

// Creates a DOM representation of the tree structure for display purposes.
function createTreeDom(node) {
  if (Object.keys(node).length === 0) {
    return null;
  }

  const ul = document.createElement("ul");
  for (let key in node) {
    const li = document.createElement("li");
    li.textContent = key;
    li.className = key.includes(".") ? "file" : "directory";

    const editSpan = document.createElement("span");
    editSpan.textContent = "Edit";
    editSpan.className = "edit";
    editSpan.onclick = () => editFile(key);

    const deleteSpan = document.createElement("span");
    deleteSpan.textContent = "Delete";
    deleteSpan.className = "delete";
    deleteSpan.onclick = () => deleteFile(key);

    if (key.includes(".")) {
      li.appendChild(editSpan);
      li.appendChild(deleteSpan);
    }
    const children = createTreeDom(node[key]);
    if (children) {
      li.appendChild(children);
    }
    ul.appendChild(li);
  }
  return ul;
}

// Attaches click event listeners to file and directory elements for interactive functionality.
function setClicks() {
  let files = document.querySelectorAll(".file");
  let directories = document.querySelectorAll(".directory");
  directories.forEach((directory) => {
    directory.addEventListener("click", function (e) {
      e.stopPropagation();
      this.classList.toggle("open");
      let children = this.querySelector("ul");
      if (children) {
        children.style.display =
          children.style.display === "none" ? "block" : "none";
      }
    });
    fileClicks(files);
  });
}

// Prevents click events on file elements.
function fileClicks(files) {
  files.forEach((file) => {
    file.addEventListener("click", (e) => {
      e.stopPropagation();
      return null;
    });
  });
}

// Handles adding a new file or directory path to the data.
function addFile() {
  const newPath = document.getElementById("new-path").value.trim();
  if (!newPath) {
    alert("No path provided.");
    return;
  }

  // Determine if newPath is a directory or a file
  const isDirectory = !newPath.includes('.');

  // Check if newPath conflicts with existing paths
  const pathConflict = data.some(existingPath => {
    if (isDirectory) {
      // For directories, check if any path starts with newPath
      return existingPath.startsWith(newPath + '/');
    } else {
      // For files, check for an exact match
      return existingPath === newPath;
    }
  });

  // Add newPath if there is no conflict
  if (!pathConflict) {
    data.push(newPath);
    console.log(data);
    tree = buildTree(data);
    updateTreeDisplay();
  } else {
    alert("This path conflicts with an existing path.");
  }
}

// Edits the file path within the data array and updates the display.
function editFile(oldFilePath) {
  let updatedFilePath;
  let filePathExists = false;

  // Find and remember the updated file path
  data.forEach((path) => {
    if (path.endsWith(oldFilePath)) {
      updatedFilePath = path;
      filePathExists = true;
    }
  });

  // Check if the file path was found
  if (!filePathExists) {
    console.error("File path not found:", oldFilePath);
    return;
  }

  // Prompt for new file path
  const newFilePath = prompt("Enter new file path", updatedFilePath);

  if (newFilePath) {
    // Check if the new file path is attempting to add a '/' after the existing file path
    if (newFilePath.startsWith(updatedFilePath + "/")) {
      alert(
        "Cannot append a new path after the existing file path:",
        oldFilePath
      );
      return;
    }

    // Update the data array with the new file path
    data = data.map((path) =>
      path.endsWith(updatedFilePath) ? newFilePath : path
    );

    // Rebuild the tree and update the display
    tree = buildTree(data);
    updateTreeDisplay();
  }
}

// Removes a file from the display and optionally from the data array.
function deleteFile(filePath) {
  let files = document.querySelectorAll(".file");
  files.forEach((file) => {
    file.innerHTML.startsWith(filePath) && file.remove();
  });
  data = data.filter(path => !path.endsWith(filePath));
}


// Updates the tree display with the current state of the tree.
function updateTreeDisplay() {
  if ( treeContainer !== null) {
  treeContainer.innerHTML = "";
  const treeDom = createTreeDom(tree);
  treeContainer.appendChild(treeDom);
  }
  setClicks();
}


module.exports = {
  buildTree,
  setClicks,
  fileClicks,
  addFile,
  createTreeDom,
  editFile,
  deleteFile,
  data,
};




// function renderTreeDisplay() {
//   const treeDom = createTreeDom(tree);
//   if ( treeContainer !== null) {
//     treeContainer.appendChild(treeDom);
//   }
//   setClicks();
// }
// renderTreeDisplay();
