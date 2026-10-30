# Rules implementation

Gameplay reference: historical Jelly Battle descriptions and player observations. Unverified implementation choices are listed below.

Implemented: 4 players, 100 HP, simultaneous jumps, two-key radius, downward icon shift, elimination at zero, last survivor; Jelly Off 1–10 rolls, 15 damage, adjacent displacement and fatal board exits; all 16 tiles and requested colors.

Weapons: Handbag 30 damage within one key for three subsequent turns; Blast 40/30/20 at distances 1/2/3; Laser 25 across row and column; Nuke 30 board-wide; Air Strike random bombs dealing 30 per hit; Random Drop anvil/metal/piano 25/35/50, visible enemy targeting with self-hit fallback. Rage doubles weapons, including Handbags. Damage ends invisibility. Freeze targets one rival for the next movement. De-Bonus removes active Handbag, Shield, Rage, Jump and Invisible bonuses.

Phase order: movement and Jelly Off, existing Handbags, expiry, Teleport, De-Bonus, other effects, weapons. Weapon priority: Handbag acquisition, Blast, Laser, Nuke, dropping attacks; lower HP then rightmost first. An eliminated attacker does not fire. The reference presents conflicting observations; this is the selected deterministic interpretation.

Unverified defaults retained explicitly: 15/12/8-second Easy/Medium/Hard timers; health +25; Shield/Rage/Invisible three resolution turns; Jump four movements; buffs refresh rather than stack; Chebyshev distance; equal dice resolved randomly; ten uniformly distributed Air Strike bombs. New Handbags start next turn. Shield blocks mines and weapons, but not Jelly Off/falling. Teleport activates its destination icon once. No invented sudden death.

Ranks: Private below 1000, Corporal 1000, Sergeant 2000, Captain 4000, Major 7500, General 15000, Field Marshall 50000. Local points are persisted in the browser: +100 per win, no loss penalty. This scoring formula is a local default because the reference does not establish the original formula.
