# GAS Project overview
This project manages automations with an Events and Todos Google spreadsheet for user. Whenever user makes an edit in the sheet, the handleEdit function is triggered and checks what has been edited and routes to specific function that manages each sheet's automations. most automations consist in extracting, transforming data from the sheets and then sending to to a webhook or to an API to enrich the data in the sheets. Use these guidelines when creating new files and distributing functions within the existing files.

## Google spreadsheet naming and structure
- "AI Project management" sheet - where todo items are managed to create epics, tasks, and other project management artifacts
    - "ProductBrief" sheet stores product brief data for context
    - "Team" sheet stores team data for context
    - "Epics" sheet stores epics data
    - "US/Tasks" sheet stores user stories and tasks data
    - "Estimates" sheet stores time and cost estimates

## Project file structure
.
├── guidelines.md - contains the project guidelines
├── README.md - contains the project setup instructions
├── Code.js - contains the handleEdit function that only monitors edits made by the user and the triggers functions in other files that contain logic for each of the sheets within the project.
├── config.js - stores links to the webhooks, external resources and any other reusable constants and settings

- The rest of the files must be name after the sheet they are managing or after their feature function. 

## Feature requirements
- we use all technologies compatible the Google Apps Script
- GASP is used for testing. 
