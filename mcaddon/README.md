# Water Ops Minecraft Bedrock Add-on

This add-on includes:
- **Water Gun item** (`wo:water_gun`) that sprays water particles, damages targets, and extinguishes fire/lava in the spray path.
- **Support Helicopter entity** (`wo:helicopter`) that can be ridden by players and auto-fires water blasts at nearby monsters.

## Quick install (already packaged)
1. Use the packaged file in this repo: **`mcaddon/WaterOps.mcaddon`**.
2. Move that file to your device.
3. Open it with Minecraft Bedrock Edition (tap/click the file) to import automatically.
4. Activate both imported packs in your world and enable script support.

## Build the .mcaddon yourself (optional)
From the repository root:
```bash
zip -r mcaddon/WaterOps.mcaddon mcaddon/WaterOps_BP mcaddon/WaterOps_RP
```

## Commands
- Give water gun: `/give @s wo:water_gun`
- Summon helicopter: `/summon wo:helicopter`
