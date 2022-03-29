Include this tag in the taxfoundation.org post:

`<div id="facts-and-figures"></div>`

Include these scripts on the taxfoundation.org post page:

    https://facts-and-figures-web.netlify.com/pym.js
    https://facts-and-figures-web.netlify.com/pymSetup.js

# Tax Foundation - Facts and Figures

## Project setup
```
npm install
```

Include this tag in the taxfoundation.org post:

`<div id="facts-and-figures"></div>`

Include these scripts on the taxfoundation.org post page:

    https://facts-and-figures-web.netlify.com/pym.js
    https://facts-and-figures-web.netlify.com/pymSetup.js


### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## Yearly facts and figures update

Every year, src/data/mappings.json must be updated to the match the format of the new facts-and-figures.xlsx. Test mappings.json with
```
npm run start
```
which will display an error for the next non complying sheet in the excel file. 

### Fields

#### Sheetname
numerical id of excel sheet
#### type
One of "states", "table", or "bracket". "states" is for sheets that list data by state, "bracket" is used for tables, and "table" is used for all other tables.
#### title 
location of sheet title. May be a range if title occupies multiple cells
#### date
date of sheet data
#### data
the data table for the sheet. Always a range in format "A6:D26" Make sure to include table headers in selection for proper rendering.
#### notes
the location of the notes cell, prefixed by "Note:"
#### footnotes
the range including all footnotes cells, delineated in sheet by (a),(b), etc prefixing the note.
#### source
the location fo source cell. 
