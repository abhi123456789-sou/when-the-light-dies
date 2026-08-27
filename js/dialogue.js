/* =========================================================
   WHEN THE LIGHT DIES
   DIALOGUE SYSTEM
   Branching Story Conversations
========================================================= */

"use strict";


const Dialogue = (() => {

    let initialized = false;
    let active = false;
    let currentDialogue = null;
    let currentIndex = 0;
    let typing = false;
    let typingTimer = null;

    let currentChoices = [];


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        hide();
    }


    /* =====================================================
       START DIALOGUE
    ===================================================== */

    function start(dialogue) {

        if (!dialogue) {
            return false;
        }


        if (
            active
        ) {

            return false;
        }


        currentDialogue =
            dialogue;

        currentIndex = 0;

        currentChoices = [];

        active = true;


        const state =
            GameState.get();


        if (state) {

            state.dialogueActive =
                true;
        }


        show();

        displayCurrentLine();

        return true;
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update() {

        if (!active) {
            return;
        }


        /*
           Dialogue input is intentionally
           SPACE based.

           ENTER is NOT used.
        */

        if (
            Input.isDialoguePressed()
        ) {

            if (typing) {

                finishTyping();

            } else if (
                currentChoices.length === 0
            ) {

                next();
            }
        }
    }


    /* =====================================================
       DISPLAY CURRENT LINE
    ===================================================== */

    function displayCurrentLine() {

        if (!currentDialogue) {
            return;
        }


        const lines =
            currentDialogue.lines || [];


        if (
            currentIndex >=
            lines.length
        ) {

            finish();

            return;
        }


        const line =
            lines[currentIndex];


        currentChoices = [];


        const character =
            document.getElementById(
                "dialogue-character"
            );


        const text =
            document.getElementById(
                "dialogue-text"
            );


        const hint =
            document.getElementById(
                "dialogue-hint"
            );


        if (character) {

            character.textContent =
                line.character ||
                "UNKNOWN";
        }


        if (text) {

            text.textContent =
                "";
        }


        if (hint) {

            hint.textContent =
                "PRESS SPACE TO CONTINUE";
        }


        typeText(
            line.text || ""
        );
    }


    /* =====================================================
       TYPEWRITER
    ===================================================== */

    function typeText(
        text
    ) {

        clearTyping();


        const element =
            document.getElementById(
                "dialogue-text"
            );


        if (!element) {
            return;
        }


        typing =
            true;


        let index = 0;


        const speed =
            currentDialogue
                ?.textSpeed ?? 25;


        function typeNext() {

            if (
                index >=
                text.length
            ) {

                typing =
                    false;

                showChoicesIfNeeded();

                return;
            }


            element.textContent +=
                text[index];


            index++;


            typingTimer =
                window.setTimeout(
                    typeNext,
                    speed
                );
        }


        typeNext();
    }


    /* =====================================================
       FINISH TYPING
    ===================================================== */

    function finishTyping() {

        if (!typing) {
            return;
        }


        clearTyping();


        const lines =
            currentDialogue?.lines ||
            [];


        const line =
            lines[currentIndex];


        const element =
            document.getElementById(
                "dialogue-text"
            );


        if (element) {

            element.textContent =
                line?.text || "";
        }


        typing =
            false;


        showChoicesIfNeeded();
    }


    /* =====================================================
       CLEAR TYPING
    ===================================================== */

    function clearTyping() {

        if (
            typingTimer !== null
        ) {

            window.clearTimeout(
                typingTimer
            );

            typingTimer =
                null;
        }
    }


    /* =====================================================
       NEXT
    ===================================================== */

    function next() {

        if (!active) {
            return;
        }


        if (typing) {

            finishTyping();

            return;
        }


        currentIndex++;

        displayCurrentLine();
    }


    /* =====================================================
       CHOICES
    ===================================================== */

    function showChoicesIfNeeded() {

        const lines =
            currentDialogue?.lines ||
            [];


        const line =
            lines[currentIndex];


        if (
            !line ||
            !line.choices ||
            line.choices.length === 0
        ) {

            return;
        }


        currentChoices =
            line.choices;


        const container =
            document.getElementById(
                "dialogue-choices"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        const hint =
            document.getElementById(
                "dialogue-hint"
            );


        if (hint) {

            hint.textContent =
                "CHOOSE YOUR RESPONSE";
        }


        currentChoices.forEach(
            (choice, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "dialogue-choice";


                button.textContent =
                    choice.text ||
                    `CHOICE ${index + 1}`;


                button.dataset.index =
                    String(index);


                button.addEventListener(
                    "click",
                    () => {

                        choose(
                            index
                        );
                    }
                );


                container.appendChild(
                    button
                );
            }
        );
    }


    /* =====================================================
       CHOOSE
    ===================================================== */

    function choose(
        index
    ) {

        if (
            !active ||
            !currentChoices[index]
        ) {

            return;
        }


        const choice =
            currentChoices[index];


        currentChoices =
            [];


        const container =
            document.getElementById(
                "dialogue-choices"
            );


        if (container) {

            container.innerHTML =
                "";
        }


        /*
           Story consequences.
        */

        if (
            choice.setFlag
        ) {

            GameState.setStoryFlag(
                choice.setFlag,
                true
            );
        }


        if (
            choice.removeFlag
        ) {

            GameState.setStoryFlag(
                choice.removeFlag,
                false
            );
        }


        if (
            choice.sanity !==
            undefined
        ) {

            GameState.changeSanity(
                choice.sanity
            );
        }


        if (
            choice.health !==
            undefined
        ) {

            if (
                choice.health < 0
            ) {

                GameState.damagePlayer(
                    Math.abs(
                        choice.health
                    )
                );

            } else {

                GameState.healPlayer(
                    choice.health
                );
            }
        }


        /*
           Inventory reward.
        */

        if (
            choice.addItem
        ) {

            GameState.addItem(
                choice.addItem
            );
        }


        /*
           Inventory removal.
        */

        if (
            choice.removeItem
        ) {

            GameState.removeItem(
                choice.removeItem
            );
        }


        /*
           Jump to another dialogue line.
        */

        if (
            Number.isInteger(
                choice.nextLine
            )
        ) {

            currentIndex =
                choice.nextLine;

            displayCurrentLine();

            return;
        }


        /*
           End dialogue.
        */

        if (
            choice.end
        ) {

            finish();

            return;
        }


        /*
           Continue normally.
        */

        next();
    }


    /* =====================================================
       SHOW
    ===================================================== */

    function show() {

        const container =
            document.getElementById(
                "dialogue-container"
            );


        if (!container) {
            return;
        }


        container.classList.add(
            "visible"
        );
    }


    /* =====================================================
       HIDE
    ===================================================== */

    function hide() {

        const container =
            document.getElementById(
                "dialogue-container"
            );


        if (!container) {
            return;
        }


        container.classList.remove(
            "visible"
        );
    }


    /* =====================================================
       FINISH
    ===================================================== */

    function finish() {

        clearTyping();


        active =
            false;


        currentDialogue =
            null;


        currentIndex =
            0;


        currentChoices =
            [];


        const state =
            GameState.get();


        if (state) {

            state.dialogueActive =
                false;
        }


        const choices =
            document.getElementById(
                "dialogue-choices"
            );


        if (choices) {

            choices.innerHTML =
                "";
        }


        hide();


        /*
           Notify story system.
        */

        if (
            typeof Story !==
            "undefined" &&
            typeof Story.onDialogueEnd ===
            "function"
        ) {

            Story.onDialogueEnd();
        }
    }


    /* =====================================================
       GETTERS
    ===================================================== */

    function isActive() {

        return active;
    }


    function getCurrentDialogue() {

        return currentDialogue;
    }


    function getCurrentLine() {

        if (!currentDialogue) {
            return null;
        }


        return (
            currentDialogue.lines?.[
                currentIndex
            ] || null
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        start,

        next,

        choose,

        finish,

        isActive,

        getCurrentDialogue,

        getCurrentLine
    };

})();
