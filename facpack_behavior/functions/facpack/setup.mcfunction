# Hide functions executing.
gamerule sendcommandfeedback false

# Fix your point using spectator.
gamemode spectator @s

# Make a ticking area.
tickingarea add ~~~ ~~~ facpack-default
# Advice about ticking area.
tellraw @s {"rawtext": [{"text": "[§4FacPack§f] §6Warning! A ticking area was created here, his name is §7facpack-default§6 but you can delete and put this in another area. It's important, this entity(facpack:dummy) needs to be always rendered."}]}

# Generate entity Area Point.
setblock ~~~ minecraft:deny 0

# Spawn dummy entity.
summon facpack:dummy ~~1~

# Generate entity Area Point.
setblock ~~1~ minecraft:stained_glass 14
setblock ~~2~ minecraft:deny 0

# Advice to set a tag to entity.
tellraw @s {"rawtext": [{"text": "[§4FacPack§f] §eType §9\"/tag @e[type=facpack:dummy, c=1] add __facpack_schema-manager__\"§e here to finish setup."}]}

# Back to default.
gamerule sendcommandfeedback true
gamemode default @s