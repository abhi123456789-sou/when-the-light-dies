/* =========================================================
   WHEN THE LIGHT DIES
   STORY ENGINE
========================================================= */

"use strict";

const Story = (() => {

    let activeDialogue = null;
    let dialogueIndex = 0;
    let waitingForChoice = false;

    const storyData = {

        chapters: {

            1: {

                id: 1,

                title: "THE AWAKENING",

                scenes: {

                    1: {

                        id: "chapter1_scene1",

                        title: "THE ROOM",

                        startDialogue: "intro_wake",

                        objective: {
                            id: "intro_start",
                            title: "Find a way out",
                            description:
                                "Something is wrong. Find out where you are."
                        }
                    }
                }
            }
        },


        dialogues: {

            intro_wake: {

                character: "UNKNOWN",

                lines: [

                    {
                        text:
                            "..."

                    },

                    {
                        text:
                            "Where... am I?"
                    },

                    {
                        text:
                            "It's too dark."
                    },

                    {
                        text:
                            "I can't remember how I got here."
                    }

                ],

                next: "intro_first_choice"
            },


            intro_first_choice: {

                character: "YOU",

                lines: [

                    {
                        text:
                            "I need to figure out what's happening."
                    }

                ],

                choices: [

                    {
                        id: "choice_search_room",

                        text:
                            "Search the room.",

                        consequences: {

                            flags: {
                                searchedRoom: true
                            }
                        },

                        next:
                            "intro_search"
                    },


                    {
                        id: "choice_call_out",

                        text:
                            "Call out for someone.",

                        consequences: {

                            flags: {
                                calledOut: true
                            },

                            sanity: -5
                        },

                        next:
                            "intro_call"
                    }
                ]
            },


            intro_search: {

                character: "YOU",

                lines: [

                    {
                        text:
                            "There has to be something here."
                    },

                    {
                        text:
                            "A door... and something on the floor."
                    }

                ],

                consequences: {

                    flags: {
                        roomSearched: true
                    }
                },

                next: null
            },


            intro_call: {

                character: "YOU",

                lines: [

                    {
                        text:
                            "Hello?"

                    },

                    {
                        text:
                            "Is anyone there?"
                    },

                    {
                        text:
                            "..."

                    },

                    {
                        text:
                            "Something just moved."
                    }

                ],

                consequences: {

                    flags: {
                        heardSomething: true
                    }
                },

                next: null
            }
        }
    };


    /* =====================================================
       GET CHAPTER
    ===================================================== */

    function getChapter(chapterId) {

        return storyData.chapters[chapterId];
    }


    /* =====================================================
       GET DIALOGUE
    ===================================================== */

    function getDialogue(dialogueId) {

        return storyData.dialogues[dialogueId];
    }


    /* =====================================================
       START DIALOGUE
    ===================================================== */

    function startDialogue(dialogueId) {

        const dialogue =
            getDialogue(dialogueId);

        if (!dialogue) {

            console.warn(
                "Dialogue not found:",
                dialogueId
            );

            return false;
        }


        activeDialogue = dialogue;

        dialogueIndex = 0;

        waitingForChoice = false;


        renderDialogue();


        return true;
    }


    /* =====================================================
       RENDER DIALOGUE
    ===================================================== */

    function renderDialogue() {

        if (!activeDialogue) {
            return;
        }


        const character =
            document.getElementById(
                "dialogue-character"
            );

        const text =
            document.getElementById(
                "dialogue-text"
            );

        const choices =
            document.getElementById(
                "dialogue-choices"
            );

        const container =
            document.getElementById(
                "dialogue-container"
            );


        if (character) {

            character.textContent =
                activeDialogue.character ||
                "UNKNOWN";
        }


        if (text) {

            const line =
                activeDialogue.lines[
                    dialogueIndex
                ];

            text.textContent =
                line
                    ? line.text
                    : "";
        }


        if (choices) {

            choices.innerHTML = "";
        }


        if (container) {

            container.classList.add(
                "active"
            );
        }


        updateDialogueHint();
    }


    /* =====================================================
       NEXT LINE
    ===================================================== */

    function next() {

        if (!activeDialogue) {
            return;
        }


        if (waitingForChoice) {
            return;
        }


        dialogueIndex++;


        if (
            dialogueIndex <
            activeDialogue.lines.length
        ) {

            renderDialogue();

            return;
        }


        if (
            activeDialogue.choices &&
            activeDialogue.choices.length
        ) {

            showChoices();

            return;
        }


        finishDialogue();
    }


    /* =====================================================
       SHOW CHOICES
    ===================================================== */

    function showChoices() {

        waitingForChoice = true;


        const choices =
            document.getElementById(
                "dialogue-choices"
            );


        if (!choices) {
            return;
        }


        choices.innerHTML = "";


        activeDialogue.choices.forEach(
            choice => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type = "button";

                button.className =
                    "dialogue-choice";


                button.textContent =
                    choice.text;


                button.addEventListener(
                    "click",
                    () => {

                        selectChoice(
                            choice
                        );
                    }
                );


                choices.appendChild(
                    button
                );
            }
        );


        updateDialogueHint();
    }


    /* =====================================================
       SELECT CHOICE
    ===================================================== */

    function selectChoice(choice) {

        if (!choice) {
            return;
        }


        GameState.setChoice(
            choice.id,
            true
        );


        applyConsequences(
            choice.consequences
        );


        waitingForChoice = false;


        if (choice.next) {

            startDialogue(
                choice.next
            );

        } else {

            finishDialogue();
        }
    }


    /* =====================================================
       APPLY CONSEQUENCES
    ===================================================== */

    function applyConsequences(
        consequences
    ) {

        if (!consequences) {
            return;
        }


        if (consequences.flags) {

            Object.entries(
                consequences.flags
            ).forEach(
                ([flag, value]) => {

                    GameState.setFlag(
                        flag,
                        value
                    );
                }
            );
        }


        if (
            typeof consequences.sanity ===
            "number"
        ) {

            GameState.changeSanity(
                consequences.sanity
            );
        }


        if (
            typeof consequences.health ===
            "number"
        ) {

            if (
                consequences.health > 0
            ) {

                GameState.healPlayer(
                    consequences.health
                );

            } else {

                GameState.damagePlayer(
                    Math.abs(
                        consequences.health
                    )
                );
            }
        }


        if (
            Array.isArray(
                consequences.addItems
            )
        ) {

            consequences.addItems.forEach(
                item => {

                    GameState.addItem(
                        item
                    );
                }
            );
        }


        if (
            Array.isArray(
                consequences.removeItems
            )
        ) {

            consequences.removeItems.forEach(
                item => {

                    GameState.removeItem(
                        item
                    );
                }
            );
        }
    }


    /* =====================================================
       FINISH
    ===================================================== */

    function finishDialogue() {

        const finishedDialogue =
            activeDialogue;


        if (
            finishedDialogue &&
            finishedDialogue.consequences
        ) {

            applyConsequences(
                finishedDialogue.consequences
            );
        }


        const nextDialogue =
            finishedDialogue
                ? finishedDialogue.next
                : null;


        activeDialogue = null;

        dialogueIndex = 0;

        waitingForChoice = false;


        const container =
            document.getElementById(
                "dialogue-container"
            );


        if (container) {

            container.classList.remove(
                "active"
            );
        }


        if (nextDialogue) {

            startDialogue(
                nextDialogue
            );
        }
    }


    /* =====================================================
       DIALOGUE HINT
    ===================================================== */

    function updateDialogueHint() {

        const hint =
            document.getElementById(
                "dialogue-hint"
            );


        if (!hint) {
            return;
        }


        if (waitingForChoice) {

            hint.textContent =
                "SELECT AN OPTION";

        } else {

            hint.textContent =
                "PRESS SPACE TO CONTINUE";
        }
    }


    /* =====================================================
       IS DIALOGUE ACTIVE
    ===================================================== */

    function isActive() {

        return activeDialogue !== null;
    }


    /* =====================================================
       IS WAITING FOR CHOICE
    ===================================================== */

    function isWaitingForChoice() {

        return waitingForChoice;
    }


    /* =====================================================
       INITIAL STORY
    ===================================================== */

    function startChapter1() {

        GameState.set(
            "chapter",
            1
        );

        GameState.set(
            "scene",
            1
        );


        GameState.setObjective(
            "intro_start",
            "Find a way out",
            "Something is wrong. Find out where you are."
        );


        startDialogue(
            "intro_wake"
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        getChapter,
        getDialogue,

        startDialogue,
        next,

        selectChoice,

        isActive,
        isWaitingForChoice,

        startChapter1
    };

})();
