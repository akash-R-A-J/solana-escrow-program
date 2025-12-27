/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/escrow.json`.
 */
export type Escrow = {
  address: "6kTpPk3Bm4SfY2KuLF5sH4cpsTwBUtyJ5j3prMB92i7Q";
  metadata: {
    name: "escrow";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "makeOffer";
      discriminator: [214, 98, 97, 35, 59, 12, 44, 178];
      accounts: [
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "tokenProgram";
        },
        {
          name: "tokenMintA";
        },
        {
          name: "tokenMintB";
        },
        {
          name: "offerMaker";
          writable: true;
          signer: true;
        },
        {
          name: "offerMakerTokenAccountA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offerMaker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "offer";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [111, 102, 102, 101, 114];
              },
              {
                kind: "arg";
                path: "id";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        }
      ];
      args: [
        {
          name: "id";
          type: "u64";
        },
        {
          name: "tokenAOfferedAmount";
          type: "u64";
        },
        {
          name: "tokenBDemandedAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "revokeOffer";
      discriminator: [248, 93, 83, 25, 45, 66, 150, 134];
      accounts: [
        {
          name: "tokenProgram";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "offerMaker";
          writable: true;
          signer: true;
          relations: ["offer"];
        },
        {
          name: "tokenMintA";
          relations: ["offer"];
        },
        {
          name: "offerMakerTokenAccountA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offerMaker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "offer";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [111, 102, 102, 101, 114];
              },
              {
                kind: "account";
                path: "offer.id";
                account: "offer";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        }
      ];
      args: [];
    },
    {
      name: "takeOffer";
      discriminator: [128, 156, 242, 207, 237, 192, 103, 240];
      accounts: [
        {
          name: "tokenProgram";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "offerTaker";
          writable: true;
          signer: true;
        },
        {
          name: "offerMaker";
          writable: true;
          relations: ["offer"];
        },
        {
          name: "tokenMintA";
        },
        {
          name: "tokenMintB";
          relations: ["offer"];
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offer";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "offerTakerTokenAccountA";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offerTaker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintA";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "offerTakerTokenAccountB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offerTaker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintB";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "offerMakerTokenAccountB";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "offerMaker";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "tokenMintB";
              }
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ];
            };
          };
        },
        {
          name: "offer";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [111, 102, 102, 101, 114];
              },
              {
                kind: "account";
                path: "offer.id";
                account: "offer";
              }
            ];
          };
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "offer";
      discriminator: [215, 88, 60, 71, 170, 162, 73, 229];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "insufficentOfferMakerBalance";
      msg: "Insufficent token balance in offer maker's account";
    },
    {
      code: 6001;
      name: "insufficentOfferTakerBalance";
      msg: "Insufficient token balance in offer taker's account";
    },
    {
      code: 6002;
      name: "invalidTokenMint";
      msg: "Demanded token must be different from offered token";
    },
    {
      code: 6003;
      name: "invalidAmount";
      msg: "Amount must be greater than zero";
    },
    {
      code: 6004;
      name: "failedVaultWithdrawal";
      msg: "Failed to withdraw tokens from vault";
    },
    {
      code: 6005;
      name: "failedVaultClosure";
      msg: "Failed to close vault account";
    },
    {
      code: 6006;
      name: "failedRefund";
      msg: "Failed to refund tokens from vault";
    }
  ];
  types: [
    {
      name: "offer";
      type: {
        kind: "struct";
        fields: [
          {
            name: "id";
            type: "u64";
          },
          {
            name: "offerMaker";
            type: "pubkey";
          },
          {
            name: "tokenMintA";
            type: "pubkey";
          },
          {
            name: "tokenMintB";
            type: "pubkey";
          },
          {
            name: "tokenBDemandedAmount";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
};
