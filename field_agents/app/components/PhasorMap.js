"use client";
import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const PhaserMap = ({ playerLat, playerLng }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    // Prevent double-mounting in strict mode
    if (gameRef.current) return;

    class MapScene extends Phaser.Scene {
      constructor() {
        super({ key: "MapScene" });
      }
      preload() {
        // Load minimap, backgrounds, or player sprite here
        // this.load.image('map', 'path_to_minimap.png');
        this.load.image("player", "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/phaser-dude.png");
      }
      create() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Example: grey background
        this.add.rectangle(width/2, height/2, width, height, 0x232526);
        
        // Centered player
        this.player = this.add.sprite(width / 2, height / 2, "player");
        this.player.setScale(0.6);

        // Example: overlay text
        this.add.text(width/2, 30, "Field Map", {
          font: "22px Arial",
          color: "#00bfff"
        }).setOrigin(0.5,0.5);
      }
      update() {
        // You could animate, or update map tiles as you receive new GPS here
      }
    }

    // Set size to fit your UI (e.g. 360x360, or "100%")
    const config = {
      type: Phaser.AUTO,
      width: 320,
      height: 320,
      backgroundColor: "#232526",
      parent: "phaser-mount", // attaches to this DOM node
      scene: [MapScene],
      physics: { default: "arcade" },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      // Destroy when component unmounts
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="phaser-mount"
      style={{
        margin: "0 auto",
        display: "block",
        width: 320,
        height: 320,
        borderRadius: "18px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        overflow: "hidden",
        background: "#232526"
      }}
    />
  );
};

export default PhaserMap;
