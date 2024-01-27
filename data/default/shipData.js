export const defaultUnits = {
    unit_blank: {
      id: "unit_blank",
      name: "MT Space",
      fpCost: -1,
      epCost: 0,
      epGain: 0,
  
      hp: 1,
      damage: 0,
  
      type: "misc",
      iconId: "",
  
      count: Infinity,
  
      isPassive: false,
      description: 
        "It does nothing, or DOES it?",
    },
  
    unit_sengine: {
      id: "unit_sengine",
      name: "The Small Engine",
      fpCost: 1,
      epCost: 1,
      epGain: 0,
  
      hp: 1,
      damage: 0,
  
      type: "engine",
      iconId: "",
  
      count: 5,
  
      isPassive: false,
      description:
        "Spend 1 energy to move this ship to one of its adjacent squares.",
    },
  
    unit_aengine: {
      id: "unit_aengine",
      name: "The Automatic Engine",
      fpCost: 1,
      epCost: 0,
      epGain: 0,
  
      hp: 1,
      damage: 0,
  
      type: "engine",
      iconId: "",
  
      count: 5,
  
      isPassive: false,
      description:
        "At the end of turn, 50% chance to randomly move this ship to one of its adjacent squares. ( Upon collision, stop moving and temporarily disables the units on this ship that collided. If equipped multiples, activate them sequentially. )",
    },
  
    unit_engine: {
      id: "unit_engine",
      name: "The Engine",
      fpCost: 2,
      epCost: 1,
      epGain: 0,
  
      hp: 1,
      damage: 0,
  
      type: "engine",
      iconId: "",
  
      count: 5,
  
      isPassive: false,
      description:
        "Allow ship to move in the battle. ( Spend energy points to move that many spaces in a straight line, perpendicular to its orientation. )",
    },
  
    unit_arocket: {
      id: "unit_arocket",
      name: "The M1-A Automatic Rocket Launcher",
      fpCost: 2,
      epCost: 0,
      epGain: 0,
  
      hp: 1,
      damage: 1,
  
      type: "artilery",
      iconId: "",
  
      count: 5,
  
      isPassive: true,
      description: 
        "At the end of turn: randomly shoot a rocket to a random space on both sides of the field.",
    },
  
    unit_rocket: {
      id: "unit_rocket",
      name: "The M1-E Rocket Launcher",
      fpCost: 2,
      epCost: 1,
      epGain: 0,
  
      type: "artilery",
      iconId: "",
  
      hp: 1,
      damage: 1,
      count: Infinity,
      isPassive: false,
      description: 
        "Shoot a rocket to a designated square"
    },
  
    unit_medic: {
      id: "unit_medic",
      name: "The Medic",
      fpCost: 3,
      epCost: 2,
      epGain: 0,
  
      type: "defensive",
      iconId: "",
  
      hp: 1,
      damage: 0,
  
      count: 5,
      isPassive: false,
      description: 
        "Revive 1 destroyed components on this ship in a 3 x 3 area centered on this unit",
    },
  
    unit_flare: {
      id: "unit_flare",
      name: "The Flare launcher",
      fpCost: 2,
      epCost: 3,
      epGain: 0,
  
      type: "intel",
      iconId: "",
  
      hp: 1,
      damage: 0,
  
      count: 5,
  
      isPassive: false,
      description:
        "Shoot a flare onto the opponent's side. ( The flare allows you to view opponent's ships in a 2 square radius around it, but dies in 3 turns )",
    },
  
    unit_radar: {
      id: "unit_radar",
      name: "The Radar",
      fpCost: 3,
      epCost: 0,
      epGain: 0,
  
      type: "intel",
      iconId: "",
  
      hp: 1,
      damage: 0,
  
      count: Infinity,
  
      isPassive: true,
      description: "Passive: You know the size of ships you hit",
    },
  
    unit_mcarrier: {
      id: "unit_mcarrier",
      name: "The Mortal Carrier",
      fpCost: 4,
      epCost: 4,
      epGain: 0,
  
      type: "artilery",
      iconId: "",
  
      hp: 1,
      damage: 1,
  
      count: 5,
  
      isPassive: false,
      description: "Spend 4 energy to shoot rocket in a 3x3 area",
    },
  
    unit_barrage: {
      id: "unit_barrage",
      name: "The M2 specialized rocket launcher",
      fpCost: 4,
      epCost: 4,
      epGain: 0,
  
      type: "artilery",
      iconId: "",
  
      hp: 1,
      damage: 1,
  
      count: 1,
  
      isPassive: false,
      description: "Shoot 6 rockets in random squares on your opponent's field",
    },
  
    unit_teleporter: {
      id: "unit_teleporter",
      name: "The Teleporter",
      fpCost: 4,
      epCost: 4,
      epGain: 0,
  
      type: "misc",
      iconId: "",
  
      hp: 1,
      damage: 1,
      count: 1,
      isPassive: false,
      description: 
        "Select 2 of your ships, choose new sapces for them to teleport to ( you can teleport to the opponent's field, in which case you can view your opponent's entire field. On collision, destroy the teleported ship ) ",
    },
  };
  
  export const defaultShips = {
    ship_small: {
      id: "ship_small",
      name: "Gunboat",
      size: [1, 1],
      fp: 1,
  
      unitSlots: [["unit_blank"]],
      weight: 1,
    },
    ship_medium: {
      id: "ship_medium",
      name: "Carrier",
      size: [2, 1],
      fp: 2,
  
      unitSlots: [["unit_blank", "unit_blank"]],
      weight: 1,
    },
    ship_xlarge: {
      id: "ship_xlarge",
      name: "Battleship",
      size: [4, 1],
      fp: 3,
  
      unitSlots: [["unit_blank", "unit_blank", "unit_blank", "unit_blank"]],
      weight: 1,
    },
    ship_large: {
      id: "ship_large",
      name: "Battlecruiser",
  
      size: [3, 2],
      fp: 3,
  
      unitSlots: [
        ["unit_blank", "unit_blank", "unit_blank"],
        ["unit_blank", "unit_blank", "unit_blank"],
      ],
      weight: 1,
    },
    ship_xxlarge: {
      id: "ship_xxlarge",
      name: "Destroyer",
      size: [4, 2],
      fp: 4,
  
      unitSlots: [
        ["unit_blank", "unit_blank", "unit_blank", "unit_blank"],
        ["unit_blank", "unit_blank", "unit_blank", "unit_blank"],
      ],
  
      weight: 2,
    },
  };
  