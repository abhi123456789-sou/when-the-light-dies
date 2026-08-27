/* =========================================================
   WHEN THE LIGHT DIES
   AUDIO ENGINE
========================================================= */

"use strict";


const AudioSystem = (() => {

    let initialized = false;

    let masterVolume = 1.0;
    let musicVolume = 0.7;
    let sfxVolume = 0.8;

    let muted = false;

    let currentMusic = null;

    const sounds = new Map();


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        loadSettings();
    }


    /* =====================================================
       LOAD SETTINGS
    ===================================================== */

    function loadSettings() {

        const saved =
            localStorage.getItem(
                "wtld_audio_settings"
            );


        if (!saved) {
            return;
        }


        try {

            const settings =
                JSON.parse(saved);


            if (
                typeof settings.masterVolume ===
                "number"
            ) {

                masterVolume =
                    settings.masterVolume;
            }


            if (
                typeof settings.musicVolume ===
                "number"
            ) {

                musicVolume =
                    settings.musicVolume;
            }


            if (
                typeof settings.sfxVolume ===
                "number"
            ) {

                sfxVolume =
                    settings.sfxVolume;
            }


            if (
                typeof settings.muted ===
                "boolean"
            ) {

                muted =
                    settings.muted;
            }


        } catch (error) {

            console.warn(
                "Could not load audio settings.",
                error
            );
        }
    }


    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    function saveSettings() {

        localStorage.setItem(

            "wtld_audio_settings",

            JSON.stringify({

                masterVolume,

                musicVolume,

                sfxVolume,

                muted
            })
        );
    }


    /* =====================================================
       REGISTER AUDIO
    ===================================================== */

    function register(
        id,
        src,
        type = "sfx"
    ) {

        if (!id || !src) {
            return false;
        }


        sounds.set(
            id,
            {

                src,

                type,

                audio: null
            }
        );


        return true;
    }


    /* =====================================================
       GET VOLUME
    ===================================================== */

    function getVolume(
        type
    ) {

        if (muted) {
            return 0;
        }


        let volume =
            masterVolume;


        if (
            type === "music"
        ) {

            volume *=
                musicVolume;

        } else {

            volume *=
                sfxVolume;
        }


        return Math.max(
            0,
            Math.min(
                1,
                volume
            )
        );
    }


    /* =====================================================
       PLAY SFX
    ===================================================== */

    function play(
        id,
        options = {}
    ) {

        const sound =
            sounds.get(id);


        if (!sound) {

            console.warn(
                "Audio not registered:",
                id
            );

            return null;
        }


        const audio =
            new Audio(
                sound.src
            );


        audio.volume =
            getVolume(
                sound.type
            );


        audio.loop =
            Boolean(
                options.loop
            );


        if (
            typeof options.volume ===
            "number"
        ) {

            audio.volume =
                Math.max(
                    0,
                    Math.min(
                        1,
                        audio.volume *
                        options.volume
                    )
                );
        }


        audio.currentTime =
            0;


        audio.play()
            .catch(
                () => {
                    /*
                       Browser autoplay restrictions
                       can prevent playback before the
                       player interacts with the page.
                    */
                }
            );


        sound.audio =
            audio;


        return audio;
    }


    /* =====================================================
       PLAY MUSIC
    ===================================================== */

    function playMusic(
        id,
        options = {}
    ) {

        stopMusic();


        const sound =
            sounds.get(id);


        if (!sound) {

            console.warn(
                "Music not registered:",
                id
            );

            return null;
        }


        const audio =
            new Audio(
                sound.src
            );


        audio.loop =
            options.loop !== false;


        audio.volume =
            getVolume(
                "music"
            );


        if (
            typeof options.volume ===
            "number"
        ) {

            audio.volume =
                Math.max(
                    0,
                    Math.min(
                        1,
                        audio.volume *
                        options.volume
                    )
                );
        }


        currentMusic =
            audio;


        audio.play()
            .catch(
                () => {}
            );


        return audio;
    }


    /* =====================================================
       STOP MUSIC
    ===================================================== */

    function stopMusic() {

        if (!currentMusic) {
            return;
        }


        currentMusic.pause();


        currentMusic.currentTime =
            0;


        currentMusic =
            null;
    }


    /* =====================================================
       FADE MUSIC
    ===================================================== */

    function fadeOutMusic(
        duration = 1000
    ) {

        if (!currentMusic) {
            return;
        }


        const audio =
            currentMusic;


        const startingVolume =
            audio.volume;


        const startTime =
            performance.now();


        function fade(
            currentTime
        ) {

            const elapsed =
                currentTime -
                startTime;


            const progress =
                Math.min(
                    elapsed /
                    duration,
                    1
                );


            audio.volume =
                startingVolume *
                (1 - progress);


            if (
                progress < 1
            ) {

                requestAnimationFrame(
                    fade
                );

            } else {

                stopMusic();
            }
        }


        requestAnimationFrame(
            fade
        );
    }


    /* =====================================================
       STOP ALL
    ===================================================== */

    function stopAll() {

        sounds.forEach(
            sound => {

                if (
                    sound.audio
                ) {

                    sound.audio.pause();

                    sound.audio.currentTime =
                        0;
                }
            }
        );


        stopMusic();
    }


    /* =====================================================
       MASTER VOLUME
    ===================================================== */

    function setMasterVolume(
        value
    ) {

        masterVolume =
            normalizeVolume(
                value
            );


        refreshVolumes();

        saveSettings();
    }


    /* =====================================================
       MUSIC VOLUME
    ===================================================== */

    function setMusicVolume(
        value
    ) {

        musicVolume =
            normalizeVolume(
                value
            );


        refreshVolumes();

        saveSettings();
    }


    /* =====================================================
       SFX VOLUME
    ===================================================== */

    function setSfxVolume(
        value
    ) {

        sfxVolume =
            normalizeVolume(
                value
            );


        refreshVolumes();

        saveSettings();
    }


    /* =====================================================
       NORMALIZE VOLUME
    ===================================================== */

    function normalizeVolume(
        value
    ) {

        value =
            Number(value);


        if (
            value > 1
        ) {

            value /=
                100;
        }


        return Math.max(
            0,
            Math.min(
                1,
                value
            )
        );
    }


    /* =====================================================
       REFRESH VOLUMES
    ===================================================== */

    function refreshVolumes() {

        sounds.forEach(
            sound => {

                if (
                    !sound.audio
                ) {

                    return;
                }


                sound.audio.volume =
                    getVolume(
                        sound.type
                    );
            }
        );


        if (currentMusic) {

            currentMusic.volume =
                getVolume(
                    "music"
                );
        }
    }


    /* =====================================================
       MUTE
    ===================================================== */

    function setMuted(
        value
    ) {

        muted =
            Boolean(value);


        refreshVolumes();

        saveSettings();
    }


    function toggleMute() {

        setMuted(
            !muted
        );


        return muted;
    }


    /* =====================================================
       GET SETTINGS
    ===================================================== */

    function getSettings() {

        return {

            masterVolume,

            musicVolume,

            sfxVolume,

            muted
        };
    }


    /* =====================================================
       SETTINGS UI
    ===================================================== */

    function connectSettingsUI() {

        const master =
            document.getElementById(
                "master-volume"
            );


        const music =
            document.getElementById(
                "music-volume"
            );


        const sfx =
            document.getElementById(
                "sfx-volume"
            );


        if (master) {

            master.value =
                masterVolume * 100;


            master.addEventListener(
                "input",
                event => {

                    setMasterVolume(
                        event.target.value
                    );
                }
            );
        }


        if (music) {

            music.value =
                musicVolume * 100;


            music.addEventListener(
                "input",
                event => {

                    setMusicVolume(
                        event.target.value
                    );
                }
            );
        }


        if (sfx) {

            sfx.value =
                sfxVolume * 100;


            sfx.addEventListener(
                "input",
                event => {

                    setSfxVolume(
                        event.target.value
                    );
                }
            );
        }
    }


    /* =====================================================
       HORROR HELPERS
    ===================================================== */

    function playFootstep() {

        play(
            "footstep"
        );
    }


    function playHeartbeat() {

        play(
            "heartbeat"
        );
    }


    function playWhisper() {

        play(
            "whisper"
        );
    }


    function playDoor() {

        play(
            "door"
        );
    }


    function playScream() {

        play(
            "scream"
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        register,

        play,

        playMusic,

        stopMusic,

        fadeOutMusic,

        stopAll,

        setMasterVolume,

        setMusicVolume,

        setSfxVolume,

        setMuted,

        toggleMute,

        getSettings,

        connectSettingsUI,

        playFootstep,

        playHeartbeat,

        playWhisper,

        playDoor,

        playScream
    };

})();
