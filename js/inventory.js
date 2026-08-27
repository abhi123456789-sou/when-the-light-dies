/* =========================================================
   WHEN THE LIGHT DIES
   INVENTORY SYSTEM
========================================================= */

"use strict";


const Inventory = (() => {

    let initialized = false;

    const maxSlots = 12;


    /* =====================================================
       ITEM DATABASE
    ===================================================== */

    const itemDatabase = {

        basement_key: {
            id: "basement_key",
            name: "Basement Key",
            description:
                "An old iron key. It looks like it hasn't been used in years.",
            type: "key",
            usable: false
        },

        small_key: {
            id: "small_key",
            name: "Small Key",
            description:
                "A small brass key with strange scratches.",
            type: "key",
            usable: false
        },

        battery: {
            id: "battery",
            name: "Battery",
            description:
                "A replacement battery for the flashlight.",
            type: "battery",
            usable: true
        },

        old_photo: {
            id: "old_photo",
            name: "Old Photograph",
            description:
                "A faded photograph. Someone has been scratched out.",
            type: "clue",
            usable: false
        },

        diary_page: {
            id: "diary_page",
            name: "Diary Page",
            description:
                "A torn page containing a disturbing message.",
            type: "clue",
            usable: false
        },

        medicine: {
            id: "medicine",
            name: "Medicine",
            description:
                "A small bottle of medicine.",
            type: "consumable",
            usable: true
        }
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        render();
    }


    /* =====================================================
       GET INVENTORY
    ===================================================== */

    function getItems() {

        const state =
            GameState.get();

        if (
            !state ||
            !state.player
        ) {

            return [];
        }

        if (
            !Array.isArray(
                state.player.inventory
            )
        ) {

            state.player.inventory = [];
        }

        return state.player.inventory;
    }


    /* =====================================================
       ADD ITEM
    ===================================================== */

    function addItem(
        itemId,
        quantity = 1
    ) {

        const item =
            itemDatabase[itemId];


        if (!item) {

            console.warn(
                "Unknown item:",
                itemId
            );

            return false;
        }


        const inventory =
            getItems();


        /*
           Stack batteries and similar items.
        */

        const existing =
            inventory.find(
                entry =>
                    entry.id === itemId
            );


        if (
            existing &&
            item.type === "battery"
        ) {

            existing.quantity =
                (existing.quantity || 1) +
                quantity;

            render();

            return true;
        }


        /*
           Prevent inventory overflow.
        */

        if (
            inventory.length >=
            maxSlots
        ) {

            showMessage(
                "Inventory is full."
            );

            return false;
        }


        inventory.push({

            id: itemId,

            quantity: quantity
        });


        render();


        /*
           Story notification.
        */

        showMessage(
            `Obtained: ${item.name}`
        );


        /*
           Story hook.
        */

        if (
            typeof Story !==
            "undefined" &&
            typeof Story.onItemObtained ===
            "function"
        ) {

            Story.onItemObtained(
                itemId
            );
        }


        return true;
    }


    /* =====================================================
       REMOVE ITEM
    ===================================================== */

    function removeItem(
        itemId,
        quantity = 1
    ) {

        const inventory =
            getItems();


        const index =
            inventory.findIndex(
                entry =>
                    entry.id === itemId
            );


        if (
            index === -1
        ) {

            return false;
        }


        const entry =
            inventory[index];


        if (
            (entry.quantity || 1) >
            quantity
        ) {

            entry.quantity -=
                quantity;

        } else {

            inventory.splice(
                index,
                1
            );
        }


        render();

        return true;
    }


    /* =====================================================
       HAS ITEM
    ===================================================== */

    function hasItem(
        itemId
    ) {

        return getItems().some(
            item =>
                item.id === itemId
        );
    }


    /* =====================================================
       GET ITEM
    ===================================================== */

    function getItem(
        itemId
    ) {

        const entry =
            getItems().find(
                item =>
                    item.id === itemId
            );


        if (!entry) {
            return null;
        }


        return {

            ...itemDatabase[itemId],

            quantity:
                entry.quantity || 1
        };
    }


    /* =====================================================
       USE ITEM
    ===================================================== */

    function useItem(
        itemId
    ) {

        const item =
            getItem(itemId);


        if (!item) {

            return false;
        }


        switch (
            item.type
        ) {

            case "battery":

                useBattery(
                    itemId
                );

                return true;


            case "consumable":

                useConsumable(
                    itemId
                );

                return true;


            case "key":

                showMessage(
                    "This item can be used when needed."
                );

                return false;


            case "clue":

                inspectItem(
                    itemId
                );

                return true;


            default:

                return false;
        }
    }


    /* =====================================================
       BATTERY
    ===================================================== */

    function useBattery(
        itemId
    ) {

        if (
            typeof Player ===
            "undefined"
        ) {

            return;
        }


        Player.rechargeBattery(
            35
        );


        removeItem(
            itemId,
            1
        );


        showMessage(
            "Flashlight battery replaced."
        );
    }


    /* =====================================================
       CONSUMABLE
    ===================================================== */

    function useConsumable(
        itemId
    ) {

        const item =
            getItem(itemId);


        if (!item) {
            return;
        }


        if (
            typeof Player !==
            "undefined"
        ) {

            Player.heal(
                20
            );
        }


        removeItem(
            itemId,
            1
        );


        showMessage(
            "You used the medicine."
        );
    }


    /* =====================================================
       INSPECT ITEM
    ===================================================== */

    function inspectItem(
        itemId
    ) {

        const item =
            getItem(itemId);


        if (!item) {
            return;
        }


        if (
            typeof Dialogue !==
            "undefined" &&
            typeof Dialogue.start ===
            "function"
        ) {

            Dialogue.start({

                textSpeed: 20,

                lines: [

                    {
                        character:
                            "ITEM",

                        text:
                            item.description
                    }
                ]
            });

        } else {

            showMessage(
                item.description
            );
        }
    }


    /* =====================================================
       CLEAR INVENTORY
    ===================================================== */

    function clear() {

        const state =
            GameState.get();


        if (
            state &&
            state.player
        ) {

            state.player.inventory =
                [];
        }


        render();
    }


    /* =====================================================
       RENDER HUD
    ===================================================== */

    function render() {

        renderSlots();

        renderFullInventory();
    }


    /* =====================================================
       HUD SLOTS
    ===================================================== */

    function renderSlots() {

        const container =
            document.getElementById(
                "inventory-slots"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        const inventory =
            getItems();


        for (
            let i = 0;
            i < maxSlots;
            i++
        ) {

            const slot =
                document.createElement(
                    "button"
                );


            slot.type =
                "button";


            slot.className =
                "inventory-slot";


            if (
                inventory[i]
            ) {

                const entry =
                    inventory[i];


                const item =
                    itemDatabase[
                        entry.id
                    ];


                slot.dataset.item =
                    entry.id;


                slot.innerHTML = `

                    <span class="item-name">
                        ${item?.name || entry.id}
                    </span>

                    ${
                        entry.quantity > 1
                            ? `<span class="item-quantity">${entry.quantity}</span>`
                            : ""
                    }
                `;


                slot.addEventListener(
                    "click",
                    () => {

                        useItem(
                            entry.id
                        );
                    }
                );


            } else {

                slot.classList.add(
                    "empty"
                );
            }


            container.appendChild(
                slot
            );
        }
    }


    /* =====================================================
       FULL INVENTORY
    ===================================================== */

    function renderFullInventory() {

        const container =
            document.getElementById(
                "full-inventory"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        const inventory =
            getItems();


        if (
            inventory.length === 0
        ) {

            container.innerHTML =
                "<p>INVENTORY EMPTY</p>";

            return;
        }


        inventory.forEach(
            entry => {

                const item =
                    itemDatabase[
                        entry.id
                    ];


                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "full-inventory-item";


                element.innerHTML = `

                    <div>
                        <strong>
                            ${item?.name || entry.id}
                        </strong>

                        ${
                            entry.quantity > 1
                                ? `<span> x${entry.quantity}</span>`
                                : ""
                        }
                    </div>

                    <p>
                        ${item?.description || ""}
                    </p>
                `;


                element.addEventListener(
                    "click",
                    () => {

                        useItem(
                            entry.id
                        );
                    }
                );


                container.appendChild(
                    element
                );
            }
        );
    }


    /* =====================================================
       OPEN INVENTORY SCREEN
    ===================================================== */

    function open() {

        const screen =
            document.getElementById(
                "inventory-screen"
            );


        if (!screen) {
            return;
        }


        renderFullInventory();


        screen.classList.add(
            "visible"
        );


        const state =
            GameState.get();


        if (state) {

            state.inventoryOpen =
                true;
        }
    }


    /* =====================================================
       CLOSE INVENTORY SCREEN
    ===================================================== */

    function close() {

        const screen =
            document.getElementById(
                "inventory-screen"
            );


        if (screen) {

            screen.classList.remove(
                "visible"
            );
        }


        const state =
            GameState.get();


        if (state) {

            state.inventoryOpen =
                false;
        }
    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    function toggle() {

        const state =
            GameState.get();


        if (
            state?.inventoryOpen
        ) {

            close();

        } else {

            open();
        }
    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function showMessage(
        message
    ) {

        if (
            typeof Interaction !==
            "undefined" &&
            typeof Interaction.notify ===
            "function"
        ) {

            Interaction.notify(
                message
            );

            return;
        }


        const container =
            document.getElementById(
                "notification-container"
            );


        if (!container) {
            return;
        }


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            "game-notification";


        notification.textContent =
            message;


        container.appendChild(
            notification
        );


        window.setTimeout(
            () => {

                notification.remove();

            },
            2500
        );
    }


    /* =====================================================
       ITEM DATABASE ACCESS
    ===================================================== */

    function getItemDatabase() {

        return {
            ...itemDatabase
        };
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        addItem,

        removeItem,

        hasItem,

        getItem,

        getItems,

        useItem,

        inspectItem,

        clear,

        open,

        close,

        toggle,

        render,

        getItemDatabase
    };

})();
