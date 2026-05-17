import { world, system, Player, ItemStack, EntityDamageCause } from "@minecraft/server";

const GUN_ID = "wo:water_gun";
const BLAST_ID = "wo:water_blast";
const HELI_ID = "wo:helicopter";

function extinguishHotBlocks(dimension, center, radius = 1) {
  for (let x = -radius; x <= radius; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -radius; z <= radius; z++) {
        const block = dimension.getBlock({ x: center.x + x, y: center.y + y, z: center.z + z });
        if (!block) continue;
        const type = block.typeId;
        if (type === "minecraft:fire" || type === "minecraft:soul_fire" || type === "minecraft:lava" || type === "minecraft:flowing_lava") {
          block.setType("minecraft:water");
        }
      }
    }
  }
}

function splashAttack(shooter, origin, viewDir, range = 12) {
  const dim = shooter.dimension;
  for (let i = 1; i <= range; i++) {
    const pos = { x: origin.x + viewDir.x * i, y: origin.y + viewDir.y * i, z: origin.z + viewDir.z * i };
    dim.spawnParticle("minecraft:splash_particle", pos);
    extinguishHotBlocks(dim, pos, 1);
    const targets = dim.getEntities({ location: pos, maxDistance: 1.8, excludeNames: [shooter.nameTag] });
    for (const target of targets) {
      if (target.id === shooter.id || target.typeId === BLAST_ID) continue;
      target.applyDamage(3, { cause: EntityDamageCause.entityAttack, damagingEntity: shooter });
      try { target.extinguishFire(true); } catch {}
      return;
    }
  }
}

world.afterEvents.itemUse.subscribe((ev) => {
  const src = ev.source;
  if (!(src instanceof Player)) return;
  if (!ev.itemStack || ev.itemStack.typeId !== GUN_ID) return;

  const head = src.getHeadLocation();
  const dir = src.getViewDirection();
  const projectile = src.dimension.spawnEntity(BLAST_ID, {
    x: head.x + dir.x,
    y: head.y + dir.y,
    z: head.z + dir.z
  });
  projectile.applyImpulse({ x: dir.x * 1.8, y: dir.y * 1.8, z: dir.z * 1.8 });
  splashAttack(src, head, dir);
});

function nearestMonster(heli) {
  const nearby = heli.dimension.getEntities({
    location: heli.location,
    maxDistance: 25,
    families: ["monster"]
  });
  let best = undefined;
  let bestD = 9999;
  for (const mob of nearby) {
    const dx = mob.location.x - heli.location.x;
    const dy = mob.location.y - heli.location.y;
    const dz = mob.location.z - heli.location.z;
    const d = dx * dx + dy * dy + dz * dz;
    if (d < bestD) {
      bestD = d;
      best = mob;
    }
  }
  return best;
}

system.runInterval(() => {
  for (const heli of world.getDimension("overworld").getEntities({ type: HELI_ID })) {
    const target = nearestMonster(heli);
    if (!target) continue;
    const origin = { x: heli.location.x, y: heli.location.y + 0.8, z: heli.location.z };
    const dx = target.location.x - origin.x;
    const dy = target.location.y + 0.8 - origin.y;
    const dz = target.location.z - origin.z;
    const len = Math.max(0.001, Math.hypot(dx, dy, dz));
    const dir = { x: dx / len, y: dy / len, z: dz / len };

    const shot = heli.dimension.spawnEntity(BLAST_ID, origin);
    shot.applyImpulse({ x: dir.x * 2.1, y: dir.y * 2.1, z: dir.z * 2.1 });
    heli.dimension.spawnParticle("minecraft:splash_particle", origin);
  }
}, 20);
