/* =========================================================
   WHEN THE LIGHT DIES
   ENEMY AI SYSTEM
========================================================= */

"use strict";


const EnemyAI = (() => {

    const enemies = new Map();

    let nextEnemyId = 1;


    const STATES = {

        IDLE: "IDLE",
        PATROL: "PATROL",
        ALERT: "ALERT",
        CHASE: "CHASE",
        SEARCH: "SEARCH",
        ATTACK: "ATTACK",
        STUNNED: "STUNNED",
        DEAD: "DEAD"
    };


    const DEFAULTS = {

        speed: 1.2,

        chaseSpeed: 2.5,

        detectionRange: 260,

        closeDetectionRange: 70,

        attackRange: 45,

        attackDamage: 15,

        attackCooldown: 1200,

        searchDuration: 5000,

        alertDuration: 1200,

        patrolRadius: 180,

        hearingRange: 220
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        enemies.clear();

        nextEnemyId = 1;
    }


    /* =====================================================
       CREATE
    ===================================================== */

    function create(config = {}) {

        const id =
            config.id ||
            `enemy_${nextEnemyId++}`;


        const enemy = {

            id,

            name:
                config.name ||
                "Unknown",

            type:
                config.type ||
                "stalker",

            x:
                number(
                    config.x,
                    0
                ),

            y:
                number(
                    config.y,
                    0
                ),

            spawnX:
                number(
                    config.x,
                    0
                ),

            spawnY:
                number(
                    config.y,
                    0
                ),

            health:
                number(
                    config.health,
                    100
                ),

            maxHealth:
                number(
                    config.health,
                    100
                ),

            speed:
                number(
                    config.speed,
                    DEFAULTS.speed
                ),

            chaseSpeed:
                number(
                    config.chaseSpeed,
                    DEFAULTS.chaseSpeed
                ),

            detectionRange:
                number(
                    config.detectionRange,
                    DEFAULTS.detectionRange
                ),

            closeDetectionRange:
                number(
                    config.closeDetectionRange,
                    DEFAULTS.closeDetectionRange
                ),

            hearingRange:
                number(
                    config.hearingRange,
                    DEFAULTS.hearingRange
                ),

            attackRange:
                number(
                    config.attackRange,
                    DEFAULTS.attackRange
                ),

            attackDamage:
                number(
                    config.attackDamage,
                    DEFAULTS.attackDamage
                ),

            attackCooldown:
                number(
                    config.attackCooldown,
                    DEFAULTS.attackCooldown
                ),

            state:
                STATES.IDLE,

            target:
                null,

            lastSeenX:
                null,

            lastSeenY:
                null,

            patrolAngle:
                Math.random() *
                Math.PI *
                2,

            attackTimer:
                0,

            alertTimer:
                0,

            searchTimer:
                0,

            stunTimer:
                0,

            enabled:
                true,

            alive:
                true,

            aggressive:
                Boolean(
                    config.aggressive
                ),

            canHear:
                config.canHear !== false,

            canSee:
                config.canSee !== false
        };


        enemies.set(
            id,
            enemy
        );


        return enemy;
    }


    /* =====================================================
       REMOVE
    ===================================================== */

    function remove(id) {

        enemies.delete(
            id
        );
    }


    /* =====================================================
       GET
    ===================================================== */

    function get(id) {

        return (
            enemies.get(id) ||
            null
        );
    }


    /* =====================================================
       GET ALL
    ===================================================== */

    function getAll() {

        return Array.from(
            enemies.values()
        );
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(delta) {

        const state =
            getGameState();


        if (!state) {
            return;
        }


        if (
            state.gamePaused ||
            state.gameOver
        ) {

            return;
        }


        enemies.forEach(
            enemy => {

                if (
                    !enemy.enabled ||
                    !enemy.alive
                ) {

                    return;
                }


                updateEnemy(
                    enemy,
                    delta
                );
            }
        );
    }


    /* =====================================================
       UPDATE ENEMY
    ===================================================== */

    function updateEnemy(
        enemy,
        delta
    ) {

        updateTimers(
            enemy,
            delta
        );


        if (
            enemy.state ===
            STATES.DEAD
        ) {

            return;
        }


        if (
            enemy.state ===
            STATES.STUNNED
        ) {

            if (
                enemy.stunTimer <= 0
            ) {

                enemy.state =
                    STATES.CHASE;
            }

            return;
        }


        const player =
            getPlayer();


        if (!player) {
            return;
        }


        const distance =
            distanceBetween(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );


        const detection =
            detectPlayer(
                enemy,
                player,
                distance
            );


        switch (
            enemy.state
        ) {

            case STATES.IDLE:

                updateIdle(
                    enemy,
                    delta,
                    detection
                );

                break;


            case STATES.PATROL:

                updatePatrol(
                    enemy,
                    delta,
                    detection
                );

                break;


            case STATES.ALERT:

                updateAlert(
                    enemy,
                    delta,
                    detection
                );

                break;


            case STATES.CHASE:

                updateChase(
                    enemy,
                    player,
                    distance,
                    detection,
                    delta
                );

                break;


            case STATES.SEARCH:

                updateSearch(
                    enemy,
                    player,
                    detection,
                    delta
                );

                break;


            case STATES.ATTACK:

                updateAttack(
                    enemy,
                    player,
                    distance
                );

                break;
        }
    }


    /* =====================================================
       TIMERS
    ===================================================== */

    function updateTimers(
        enemy,
        delta
    ) {

        const milliseconds =
            delta * 1000;


        enemy.attackTimer =
            Math.max(
                0,
                enemy.attackTimer -
                milliseconds
            );


        enemy.alertTimer =
            Math.max(
                0,
                enemy.alertTimer -
                milliseconds
            );


        enemy.searchTimer =
            Math.max(
                0,
                enemy.searchTimer -
                milliseconds
            );


        enemy.stunTimer =
            Math.max(
                0,
                enemy.stunTimer -
                milliseconds
            );
    }


    /* =====================================================
       IDLE
    ===================================================== */

    function updateIdle(
        enemy,
        delta,
        detection
    ) {

        if (
            detection.detected
        ) {

            enterAlert(
                enemy
            );

            return;
        }


        enemy.patrolAngle +=
            delta *
            0.3;


        if (
            Math.random() <
            0.005
        ) {

            enemy.state =
                STATES.PATROL;
        }
    }


    /* =====================================================
       PATROL
    ===================================================== */

    function updatePatrol(
        enemy,
        delta,
        detection
    ) {

        if (
            detection.detected
        ) {

            enterAlert(
                enemy
            );

            return;
        }


        enemy.patrolAngle +=
            delta *
            0.45;


        const targetX =
            enemy.spawnX +
            Math.cos(
                enemy.patrolAngle
            ) *
            DEFAULTS.patrolRadius;


        const targetY =
            enemy.spawnY +
            Math.sin(
                enemy.patrolAngle
            ) *
            DEFAULTS.patrolRadius;


        moveTowards(
            enemy,
            targetX,
            targetY,
            enemy.speed,
            delta
        );
    }


    /* =====================================================
       ALERT
    ===================================================== */

    function enterAlert(
        enemy
    ) {

        enemy.state =
            STATES.ALERT;

        enemy.alertTimer =
            DEFAULTS.alertDuration;


        trigger(
            "enemy_alert",
            enemy
        );
    }


    function updateAlert(
        enemy,
        delta,
        detection
    ) {

        if (
            detection.detected
        ) {

            enemy.lastSeenX =
                detection.playerX;

            enemy.lastSeenY =
                detection.playerY;

            enemy.state =
                STATES.CHASE;

            enemy.target =
                "player";

            enemy.searchTimer =
                DEFAULTS.searchDuration;

            trigger(
                "enemy_chase",
                enemy
            );

            return;
        }


        if (
            enemy.alertTimer <= 0
        ) {

            enemy.state =
                STATES.SEARCH;

            enemy.searchTimer =
                DEFAULTS.searchDuration;
        }
    }


    /* =====================================================
       CHASE
    ===================================================== */

    function updateChase(
        enemy,
        player,
        distance,
        detection,
        delta
    ) {

        if (
            detection.detected
        ) {

            enemy.lastSeenX =
                player.x;

            enemy.lastSeenY =
                player.y;

            enemy.searchTimer =
                DEFAULTS.searchDuration;


            if (
                distance <=
                enemy.attackRange
            ) {

                enemy.state =
                    STATES.ATTACK;

                updateAttack(
                    enemy,
                    player,
                    distance
                );

                return;
            }


            moveTowards(
                enemy,
                player.x,
                player.y,
                enemy.chaseSpeed,
                delta
            );


            return;
        }


        /*
           Player disappeared.
           Enemy goes to last known position.
        */

        enemy.state =
            STATES.SEARCH;

        enemy.searchTimer =
            DEFAULTS.searchDuration;
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function updateSearch(
        enemy,
        player,
        detection,
        delta
    ) {

        if (
            detection.detected
        ) {

            enemy.state =
                STATES.CHASE;

            enemy.target =
                "player";

            return;
        }


        if (
            enemy.lastSeenX === null ||
            enemy.lastSeenY === null
        ) {

            enemy.state =
                STATES.PATROL;

            return;
        }


        const distance =
            distanceBetween(
                enemy.x,
                enemy.y,
                enemy.lastSeenX,
                enemy.lastSeenY
            );


        if (
            distance > 8
        ) {

            moveTowards(
                enemy,
                enemy.lastSeenX,
                enemy.lastSeenY,
                enemy.speed,
                delta
            );

            return;
        }


        /*
           Search around last known position.
        */

        enemy.patrolAngle +=
            delta *
            1.8;


        const searchRadius =
            45;


        const searchX =
            enemy.lastSeenX +
            Math.cos(
                enemy.patrolAngle
            ) *
            searchRadius;


        const searchY =
            enemy.lastSeenY +
            Math.sin(
                enemy.patrolAngle
            ) *
            searchRadius;


        moveTowards(
            enemy,
            searchX,
            searchY,
            enemy.speed,
            delta
        );


        if (
            enemy.searchTimer <= 0
        ) {

            enemy.state =
                STATES.PATROL;

            enemy.target =
                null;

            enemy.lastSeenX =
                null;

            enemy.lastSeenY =
                null;
        }
    }


    /* =====================================================
       ATTACK
    ===================================================== */

    function updateAttack(
        enemy,
        player,
        distance
    ) {

        if (
            distance >
            enemy.attackRange
        ) {

            enemy.state =
                STATES.CHASE;

            return;
        }


        if (
            enemy.attackTimer > 0
        ) {

            return;
        }


        enemy.attackTimer =
            enemy.attackCooldown;


        if (
            typeof Player !==
            "undefined" &&
            typeof Player.damage ===
            "function"
        ) {

            Player.damage(
                enemy.attackDamage
            );
        }


        trigger(
            "enemy_attack",
            enemy
        );
    }


    /* =====================================================
       DETECT PLAYER
    ===================================================== */

    function detectPlayer(
        enemy,
        player,
        distance
    ) {

        const result = {

            detected: false,

            playerX:
                player.x,

            playerY:
                player.y,

            reason:
                null
        };


        if (
            !enemy.canSee &&
            !enemy.canHear
        ) {

            return result;
        }


        /*
           Very close detection.
        */

        if (
            distance <=
            enemy.closeDetectionRange
        ) {

            result.detected =
                true;

            result.reason =
                "PROXIMITY";

            return result;
        }


        /*
           Flashlight detection.
        */

        if (
            enemy.canSee &&
            player.flashlightOn &&
            distance <=
            enemy.detectionRange
        ) {

            result.detected =
                true;

            result.reason =
                "FLASHLIGHT";

            return result;
        }


        /*
           Running creates noise.
        */

        if (
            enemy.canHear &&
            player.isRunning &&
            distance <=
            enemy.hearingRange
        ) {

            result.detected =
                true;

            result.reason =
                "NOISE";

            return result;
        }


        return result;
    }


    /* =====================================================
       HEAR NOISE
    ===================================================== */

    function hearNoise(
        x,
        y,
        radius = DEFAULTS.hearingRange
    ) {

        enemies.forEach(
            enemy => {

                if (
                    !enemy.enabled ||
                    !enemy.alive ||
                    !enemy.canHear
                ) {

                    return;
                }


                const distance =
                    distanceBetween(
                        enemy.x,
                        enemy.y,
                        x,
                        y
                    );


                if (
                    distance <=
                    radius
                ) {

                    enemy.lastSeenX =
                        x;

                    enemy.lastSeenY =
                        y;

                    enemy.state =
                        STATES.SEARCH;

                    enemy.searchTimer =
                        DEFAULTS.searchDuration;


                    trigger(
                        "enemy_heard_noise",
                        enemy
                    );
                }
            }
        );
    }


    /* =====================================================
       DAMAGE
    ===================================================== */

    function damage(
        id,
        amount
    ) {

        const enemy =
            get(id);


        if (
            !enemy ||
            !enemy.alive
        ) {

            return false;
        }


        const damageAmount =
            Math.max(
                0,
                number(
                    amount,
                    0
                )
            );


        enemy.health -=
            damageAmount;


        if (
            enemy.health <= 0
        ) {

            kill(
                id
            );

        } else {

            enemy.state =
                STATES.ALERT;
        }


        return true;
    }


    /* =====================================================
       STUN
    ===================================================== */

    function stun(
        id,
        duration = 2000
    ) {

        const enemy =
            get(id);


        if (
            !enemy ||
            !enemy.alive
        ) {

            return;
        }


        enemy.state =
            STATES.STUNNED;


        enemy.stunTimer =
            Math.max(
                0,
                Number(duration) ||
                0
            );
    }


    /* =====================================================
       KILL
    ===================================================== */

    function kill(
        id
    ) {

        const enemy =
            get(id);


        if (!enemy) {
            return;
        }


        enemy.health =
            0;

        enemy.alive =
            false;

        enemy.enabled =
            false;

        enemy.state =
            STATES.DEAD;

        enemy.target =
            null;


        trigger(
            "enemy_death",
            enemy
        );
    }


    /* =====================================================
       ENABLE
    ===================================================== */

    function enable(
        id
    ) {

        const enemy =
            get(id);


        if (enemy) {

            enemy.enabled =
                true;
        }
    }


    /* =====================================================
       DISABLE
    ===================================================== */

    function disable(
        id
    ) {

        const enemy =
            get(id);


        if (enemy) {

            enemy.enabled =
                false;
        }
    }


    /* =====================================================
       MOVE
    ===================================================== */

    function moveTowards(
        enemy,
        targetX,
        targetY,
        speed,
        delta
    ) {

        const dx =
            targetX -
            enemy.x;


        const dy =
            targetY -
            enemy.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <= 0.001
        ) {

            return;
        }


        enemy.x +=
            (
                dx /
                distance
            ) *
            speed *
            delta;


        enemy.y +=
            (
                dy /
                distance
            ) *
            speed *
            delta;
    }


    /* =====================================================
       DISTANCE
    ===================================================== */

    function distanceBetween(
        x1,
        y1,
        x2,
        y2
    ) {

        const dx =
            x2 - x1;


        const dy =
            y2 - y1;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }


    /* =====================================================
       GET PLAYER
    ===================================================== */

    function getPlayer() {

        if (
            typeof Player ===
            "undefined" ||
            typeof Player.getState !==
            "function"
        ) {

            return null;
        }


        const player =
            Player.getState();


        if (!player) {
            return null;
        }


        /*
           Compatibility with the
           existing player system.
        */

        if (
            typeof player.x !==
            "number"
        ) {

            player.x = 0;
        }


        if (
            typeof player.y !==
            "number"
        ) {

            player.y = 0;
        }


        return player;
    }


    /* =====================================================
       GET GAME STATE
    ===================================================== */

    function getGameState() {

        if (
            typeof GameState ===
            "undefined" ||
            typeof GameState.get !==
            "function"
        ) {

            return null;
        }


        return GameState.get();
    }


    /* =====================================================
       EVENT BRIDGE
    ===================================================== */

    function trigger(
        eventName,
        enemy
    ) {

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.trigger ===
            "function"
        ) {

            Events.trigger(
                eventName,
                {
                    enemyId:
                        enemy.id,

                    enemyType:
                        enemy.type,

                    x:
                        enemy.x,

                    y:
                        enemy.y
                }
            );
        }
    }


    /* =====================================================
       NUMBER HELPER
    ===================================================== */

    function number(
        value,
        fallback
    ) {

        const parsed =
            Number(value);


        if (
            Number.isFinite(
                parsed
            )
        ) {

            return parsed;
        }


        return fallback;
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        STATES,

        initialize,

        create,

        remove,

        get,

        getAll,

        update,

        damage,

        stun,

        kill,

        enable,

        disable,

        hearNoise
    };

})();
