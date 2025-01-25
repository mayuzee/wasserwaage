class TiltAngle {
    constructor(id, x, y, z, createdAt = new Date(), isOnline = false) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        this.createdAt = createdAt;
        this.isOnline = isOnline;
    }

    toJson() {
        return {
            localStorage: () => {
                return {
                    ...this,
                    createdAt: this.createdAt.toISOString(),
                };
            },

            server: () => {
                return {
                    x: this.x,
                    y: this.y,
                    z: this.z,
                    created_at: this.createdAt.toISOString(),
                };
            },
        };
    }

    static fromJson(json) {
        return {
            localStorage: () => {
                const obj = JSON.parse(json);
                return new TiltAngle(
                    obj.id,
                    obj.x,
                    obj.y,
                    obj.z,
                    new Date(Date.parse(obj.createdAt))
                );
            },

            server: () => {
                return new TiltAngle(
                    json.id,
                    json.x,
                    json.y,
                    json.z,
                    new Date(Date.parse(json.created_at)),
                    true
                );
            },
        };
    }
}

class Storage {
    constructor() {
        this.url = 'http://35.192.188.26:3000';
        this.tableName = 'tilt_angles';
        this.token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoid2ViX3VzZXIifQ.PfNEZzS7yKmbYmRKMYDcRfB93HjZQSv2gXg7ZoVH1gQ';
        this.maxItemId = 0;
    }

    checkPoliteness(pls) {
        if (pls !== 'plis') throw new SyntaxError('You did not say please!');
    }

    async makeMeAllTiltAngles(pls, isOnline, orderBy = 'id', ascending = true) {
        this.checkPoliteness(pls);

        if (orderBy !== 'id' && orderBy !== 'created_at') {
            throw new Error(
                'orderBy must be id or created_at! Given: ' + orderBy
            );
        }

        let tiltAngles = [];
        if (isOnline) {
            console.info('Searching for tilt angles online...');
            const response = await fetch(
                `${this.url}/${this.tableName}?order=${orderBy}.${
                    ascending ? 'asc' : 'desc'
                }`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                }
            );

            if (!response.ok) {
                console.error(
                    'Error while making all tilt angles:',
                    response.statusText
                );
            }

            tiltAngles = (await response.json()).map((obj) =>
                TiltAngle.fromJson(obj).server()
            );
            console.info(`Found ${tiltAngles.length} tilt angles online`);
        } else {
            console.info('Ups offline, searching locally...');

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('tilt_angle_')) {
                    tiltAngles.push(
                        TiltAngle.fromJson(
                            localStorage.getItem(key)
                        ).localStorage()
                    );
                }
            }

            console.info(`Found ${tiltAngles.length} tilt angles locally`);
        }

        this.maxItemId = Math.max(
            ...tiltAngles.map((tiltAngle) => tiltAngle.id),
            this.maxItemId
        );

        return tiltAngles;
    }

    async hereTakeThisTiltAngle(pls, x, y, z, isOnline) {
        this.checkPoliteness(pls);

        let tiltAngle = new TiltAngle(this.maxItemId + 1, x, y, z);

        if (isOnline) {
            console.info('Sending tilt angle to server...', tiltAngle);
            const response = await fetch(`${this.url}/${this.tableName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                    Prefer: 'return=representation',
                },
                body: tiltAngle.toJson().server(),
            });

            if (!response.ok) {
                console.error(
                    'Error while giving a tilt angle to server:',
                    tiltAngle,
                    response
                );
            }

            tiltAngle = TiltAngle.fromJson(await response.json()).server();
        }

        localStorage.setItem(
            `tilt_angle_${tiltAngle.id}`,
            JSON.stringify(tiltAngle.toJson().localStorage())
        );

        this.maxItemId = tiltAngle.id;
        console.info('Yayy it worked, we added:', tiltAngle);
    }

    async makeTiltAngleDead(pls, id, isOnline) {
        this.checkPoliteness(pls);

        if (isOnline) {
            console.info('Deleting tilt angle online...', id);
            const response = await fetch(
                `${this.url}/${this.tableName}?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        Prefer: 'return=representation',
                    },
                }
            );

            if (!response.ok) {
                console.error('Error while deleting a tilt angle:', response);
            }

            if ((await response.json()).length === 0) {
                console.warn("Tilt angle with this id didn't exist:", id);
            }

            console.info('BAM, completely deleted:', id);
        }

        localStorage.removeItem(`tilt_angle_${id}`);
    }

    async uploadMyTiltAnglesToServer(pls, tiltAngles) {
        this.checkPoliteness(pls);

        const response = await fetch(`${this.url}/${this.tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
                Prefer: 'return=representation',
            },
            body: JSON.stringify(
                tiltAngles.map((tiltAngle) => tiltAngle.toJson().server())
            ),
        });

        if (!response.ok) {
            console.error(
                'Error while uploading tilt angles to server:',
                response
            );
        }
    }

    async skibidiCommitLocalTiltAnglesToServer(pls) {
        this.checkPoliteness(pls);

        console.info('Commiting local tilt angles to server...');
        const tiltAngles = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('tilt_angle_')) {
                const tiltAngle = TiltAngle.fromJson(
                    localStorage.getItem(key)
                ).localStorage();

                if (tiltAngle.isOnline) continue;

                tiltAngles.push(tiltAngle);
            }
        }

        await this.uploadMyTiltAnglesToServer(pls, tiltAngles);
        console.info('All local tilt angles are now online');
    }

    async deleteAllTiltAngles(pls, isOnline, keepLocal = false) {
        this.checkPoliteness(pls);

        if (isOnline) {
            console.info('Deleting all tilt angles online...');
            const response = await fetch(`${this.url}/${this.tableName}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    Prefer: 'return=representation',
                },
            });

            if (!response.ok) {
                console.error(
                    'Error while deleting all tilt angles:',
                    response
                );
            }

            console.info('BAM, completely deleted all tilt angles');
        }

        if (!keepLocal) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('tilt_angle_')) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
}

export const uwu = new Storage();
// await uwu.deleteAllTiltAngles('plis', true);
// // test insert before
// const allAngles = await uwu.makeMeAllTiltAngles('plis', false);
// console.log(allAngles);

// await uwu.hereTakeThisTiltAngle('plis', 1, 2, 3, false);
// await uwu.hereTakeThisTiltAngle('plis', 4, 5, 6, false);
// await uwu.hereTakeThisTiltAngle('plis', 7, 8, 9, false);

// const allAngles2 = await uwu.makeMeAllTiltAngles('plis', false);
// const serverAngles = await uwu.makeMeAllTiltAngles('plis', true);

// console.log(serverAngles);
// console.log(allAngles2);

// await uwu.skibidiCommitLocalTiltAnglesToServer('plis');

// const allAngles3 = await uwu.makeMeAllTiltAngles('plis', false);
// const serverAngles2 = await uwu.makeMeAllTiltAngles('plis', true);

// console.log(serverAngles2);
// console.log(allAngles3);
