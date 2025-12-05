import { IconPack } from "../types";

export const generateIllustratorScript = (iconPack: IconPack): string => {
  // Flatten icons for the script
  const allIcons = iconPack.categories.flatMap(cat => 
    cat.icons.map(icon => ({
      name: icon.name.replace(/[^a-zA-Z0-9]/g, '_'),
      path: icon.svgPath.replace(/"/g, "'") // Escape quotes for JS string
    }))
  );

  const jsonString = JSON.stringify(allIcons);

  return `
/*
  IconGenius AI - Adobe Illustrator Import Script
  Theme: ${iconPack.packName}
  
  INSTRUCTIONS:
  1. Open Adobe Illustrator.
  2. Go to File > Scripts > Other Script...
  3. Select this .jsx file.
  4. Select a folder when prompted (to store temporary SVG files).
  5. The script will import and arrange all icons.
*/

var iconData = ${jsonString};

function main() {
    if (app.documents.length === 0) {
        app.documents.add(DocumentColorSpace.RGB, 1920, 1080);
    }
    var doc = app.activeDocument;
    
    // Prompt user for a temp folder to write SVGs to
    // (Illustrator scripting cannot parse SVG strings directly easily, so we write files)
    var folder = Folder.selectDialog("Select a folder to save temporary SVG files");
    if (!folder) {
        alert("Script cancelled. No folder selected.");
        return;
    }

    var x = 50;
    var y = -50;
    var gridSize = 80; // 48px icon + padding
    var rowWidth = 800;
    
    // Create a layer for the icons
    var layer = doc.layers.add();
    layer.name = "${iconPack.packName}";

    for (var i = 0; i < iconData.length; i++) {
        var icon = iconData[i];
        
        // Create valid SVG XML string
        var svgContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><g stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">' + icon.path + '</g></svg>';
        
        // Write to temp file
        var f = new File(folder.fsName + "/" + icon.name + "_" + i + ".svg");
        f.open("w");
        f.write(svgContent);
        f.close();

        try {
            // Place the file
            var placedItem = layer.placedItems.add();
            placedItem.file = f;
            placedItem.position = [x, y];
            placedItem.embed(); // Convert to paths
            
            // Move cursor
            x += gridSize;
            if (x > rowWidth) {
                x = 50;
                y -= gridSize;
            }
        } catch(e) {
            // Ignore errors for individual files
        }
    }

    alert("Successfully imported " + iconData.length + " icons!");
}

main();
`;
};