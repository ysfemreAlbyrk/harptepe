import Phaser from 'phaser';
import { KINGDOMS } from '../data/gameData';
import type { GameState, KingdomId } from '../types';
import { calculateKingdomScore, getKingdomDefinition } from '../utils/gameMath';
import {
  CAMERA_HOME_Y,
  CHEST_POSITIONS,
  KINGDOM_POSITIONS,
  MAX_USER_ZOOM,
  MIN_USER_ZOOM,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  percentToWorld,
} from './mapLayout';
import { createTerrainCanvas } from './terrainPainter';

export interface KingdomMapBridge {
  state: GameState;
  round: number;
  selectedKingdom: KingdomId;
  onSelect: (kingdomId: KingdomId) => void;
  onDraggingChange?: (dragging: boolean) => void;
  onReady?: () => void;
  scene?: KingdomMapScene;
}

interface KingdomView {
  container: Phaser.GameObjects.Container;
  selection: Phaser.GameObjects.Ellipse;
  stats: Phaser.GameObjects.Text;
  namePlate: Phaser.GameObjects.Rectangle;
  statsPlate: Phaser.GameObjects.Rectangle;
}

interface ChestView {
  body: Phaser.GameObjects.Rectangle;
  lid: Phaser.GameObjects.Rectangle;
  band: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

function colorNumber(hex: string): number {
  return Phaser.Display.Color.HexStringToColor(hex).color;
}

function mixHex(hex: string, target: string, amount: number): string {
  const a = Phaser.Display.Color.HexStringToColor(hex);
  const b = Phaser.Display.Color.HexStringToColor(target);
  const mix = (left: number, right: number) => Math.round(left + (right - left) * amount);
  return `rgb(${mix(a.red, b.red)}, ${mix(a.green, b.green)}, ${mix(a.blue, b.blue)})`;
}

function createCloudTexture(scene: Phaser.Scene) {
  const key = 'harptepe-cloud-shadow';
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const blobs = [
    [130, 126, 118, 62], [220, 104, 142, 76], [318, 126, 126, 66],
    [220, 148, 196, 58], [92, 148, 92, 42], [396, 144, 84, 42],
  ];
  blobs.forEach(([x, y, rx, ry]) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    gradient.addColorStop(0, 'rgba(238, 235, 205, 0.18)');
    gradient.addColorStop(0.58, 'rgba(238, 235, 205, 0.09)');
    gradient.addColorStop(1, 'rgba(238, 235, 205, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  scene.textures.addCanvas(key, canvas);
}

function createShipTexture(scene: Phaser.Scene) {
  const key = 'harptepe-ambient-ship';
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = 140;
  canvas.height = 110;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  ctx.fillStyle = 'rgba(25, 35, 31, 0.22)';
  ctx.beginPath();
  ctx.ellipse(70, 88, 48, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5b321d';
  ctx.strokeStyle = 'rgba(30, 19, 10, 0.82)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(28, 66);
  ctx.quadraticCurveTo(70, 86, 113, 66);
  ctx.lineTo(103, 82);
  ctx.quadraticCurveTo(70, 96, 38, 82);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(42, 27, 14, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 68);
  ctx.lineTo(70, 16);
  ctx.stroke();

  const sail = ctx.createLinearGradient(42, 19, 99, 61);
  sail.addColorStop(0, '#efe0ae');
  sail.addColorStop(1, '#bfa56e');
  ctx.fillStyle = sail;
  ctx.strokeStyle = 'rgba(55, 35, 17, 0.68)';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(72, 18);
  ctx.quadraticCurveTo(104, 34, 101, 64);
  ctx.lineTo(72, 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(68, 22);
  ctx.quadraticCurveTo(42, 38, 45, 60);
  ctx.lineTo(68, 60);
  ctx.closePath();
  ctx.fillStyle = '#dcc38b';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8f2f22';
  ctx.beginPath();
  ctx.moveTo(71, 12);
  ctx.lineTo(94, 17);
  ctx.lineTo(71, 23);
  ctx.closePath();
  ctx.fill();

  scene.textures.addCanvas(key, canvas);
}

function createKingdomMarkerTexture(scene: Phaser.Scene, key: string, color: string) {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const bannerDark = mixHex(color, '#2d1c0e', 0.25);
  const wall = '#8b7a5e';
  const wallLight = '#b39d73';
  const wallDark = '#4d3825';
  const outline = 'rgba(39, 25, 13, 0.86)';

  ctx.fillStyle = 'rgba(31, 22, 12, 0.34)';
  ctx.beginPath();
  ctx.ellipse(80, 127, 52, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  const mound = ctx.createLinearGradient(35, 92, 122, 134);
  mound.addColorStop(0, '#8b8655');
  mound.addColorStop(0.55, '#6f6d43');
  mound.addColorStop(1, '#4d4b31');
  ctx.fillStyle = mound;
  ctx.beginPath();
  ctx.ellipse(80, 113, 56, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.2;

  for (const house of [
    { x: 31, y: 94, w: 19, h: 17 },
    { x: 112, y: 96, w: 18, h: 16 },
  ]) {
    ctx.fillStyle = '#a87845';
    ctx.fillRect(house.x, house.y, house.w, house.h);
    ctx.strokeRect(house.x, house.y, house.w, house.h);
    ctx.fillStyle = '#6c3422';
    ctx.beginPath();
    ctx.moveTo(house.x - 3, house.y);
    ctx.lineTo(house.x + house.w / 2, house.y - 11);
    ctx.lineTo(house.x + house.w + 3, house.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = wallDark;
  ctx.beginPath();
  ctx.moveTo(44, 111);
  ctx.lineTo(116, 111);
  ctx.lineTo(108, 75);
  ctx.lineTo(52, 75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = wall;
  ctx.beginPath();
  ctx.moveTo(48, 106);
  ctx.lineTo(112, 106);
  ctx.lineTo(106, 78);
  ctx.lineTo(54, 78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  for (let notch = 0; notch < 7; notch += 1) {
    ctx.fillStyle = notch % 2 ? wall : wallLight;
    ctx.fillRect(51 + notch * 9, 69, 7, 12);
    ctx.strokeRect(51 + notch * 9, 69, 7, 12);
  }

  for (const tower of [
    { x: 43, y: 57, w: 25, h: 55 },
    { x: 93, y: 57, w: 25, h: 55 },
  ]) {
    const towerGradient = ctx.createLinearGradient(tower.x, tower.y, tower.x + tower.w, tower.y + tower.h);
    towerGradient.addColorStop(0, wallLight);
    towerGradient.addColorStop(0.58, wall);
    towerGradient.addColorStop(1, wallDark);
    ctx.fillStyle = towerGradient;
    ctx.fillRect(tower.x, tower.y, tower.w, tower.h);
    ctx.strokeRect(tower.x, tower.y, tower.w, tower.h);
    for (let notch = 0; notch < 3; notch += 1) {
      ctx.fillRect(tower.x + notch * 8, tower.y - 9, 6, 11);
      ctx.strokeRect(tower.x + notch * 8, tower.y - 9, 6, 11);
    }
    ctx.fillStyle = 'rgba(35, 22, 12, 0.72)';
    ctx.fillRect(tower.x + 9, tower.y + 19, 7, 12);
  }

  const keepGradient = ctx.createLinearGradient(66, 40, 98, 116);
  keepGradient.addColorStop(0, '#c0aa7c');
  keepGradient.addColorStop(0.54, '#93805f');
  keepGradient.addColorStop(1, '#5b422c');
  ctx.fillStyle = keepGradient;
  ctx.fillRect(66, 43, 31, 72);
  ctx.strokeRect(66, 43, 31, 72);
  for (let notch = 0; notch < 4; notch += 1) {
    ctx.fillStyle = notch % 2 ? wallLight : '#c7b181';
    ctx.fillRect(66 + notch * 8, 34, 6, 12);
    ctx.strokeRect(66 + notch * 8, 34, 6, 12);
  }

  ctx.fillStyle = 'rgba(35, 22, 12, 0.82)';
  ctx.beginPath();
  ctx.moveTo(73, 115);
  ctx.lineTo(73, 94);
  ctx.quadraticCurveTo(81, 84, 89, 94);
  ctx.lineTo(89, 115);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(31, 20, 10, 0.7)';
  ctx.fillRect(76, 55, 8, 12);
  ctx.fillRect(54, 82, 6, 10);
  ctx.fillRect(102, 82, 6, 10);

  ctx.strokeStyle = 'rgba(35, 22, 12, 0.9)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(82, 37);
  ctx.lineTo(82, 14);
  ctx.stroke();

  ctx.fillStyle = bannerDark;
  ctx.beginPath();
  ctx.moveTo(83, 15);
  ctx.lineTo(117, 23);
  ctx.lineTo(108, 31);
  ctx.lineTo(83, 29);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(35, 22, 12, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = 'rgba(240, 223, 178, 0.7)';
  ctx.beginPath();
  ctx.moveTo(90, 20);
  ctx.lineTo(103, 23);
  ctx.lineTo(99, 27);
  ctx.lineTo(90, 25);
  ctx.closePath();
  ctx.fill();

  scene.textures.addCanvas(key, canvas);
}

export class KingdomMapScene extends Phaser.Scene {
  private bridge: KingdomMapBridge;
  private baseZoom = 1;
  private userZoom = 1;
  private dragPointerId: number | null = null;
  private pinching = false;
  private pinchStartDistance = 0;
  private pinchStartZoom = 1;
  private lastDragX = 0;
  private lastDragY = 0;
  private kingdomViews = {} as Record<KingdomId, KingdomView>;
  private chestViews: ChestView[] = [];

  constructor(bridge: KingdomMapBridge) {
    super('kingdom-map');
    this.bridge = bridge;
  }

  create() {
    this.createTerrain();
    this.createRegionLabels();
    this.createClouds();
    this.createAmbientLife();
    this.createChests();
    this.createKingdoms();
    this.createCompass();
    this.setupInput();

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      if (this.bridge.scene === this) this.bridge.scene = undefined;
    });

    this.bridge.scene = this;
    this.fitCamera(true);
    this.syncDynamic();
    this.bridge.onReady?.();
  }

  private createTerrain() {
    const key = 'harptepe-terrain';
    if (this.textures.exists(key)) this.textures.remove(key);
    this.textures.addCanvas(key, createTerrainCanvas());
    this.add.image(0, 0, key)
      .setOrigin(0)
      .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
      .setDepth(0);
  }

  private createRegionLabels() {
    const style = {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '18px',
      color: '#6b522d',
      fontStyle: '700',
    };
    const labels = [
      { x: 49, y: 11, text: 'KUZEY TARLALARI' },
      { x: 15, y: 48, text: 'BATI ORMANLARI' },
      { x: 81, y: 23, text: 'DOĞU MADENLERİ' },
      { x: 50, y: 94, text: 'GÜNEY LİMAN YOLU' },
    ];

    labels.forEach((label) => {
      this.add.text((label.x / 100) * WORLD_WIDTH, (label.y / 100) * WORLD_HEIGHT, label.text, style)
        .setOrigin(0.5)
        .setAlpha(0.28)
        .setDepth(2);
    });
  }

  private createClouds() {
    createCloudTexture(this);
    const clouds = [
      { x: -320, y: 170, scale: 1.35, alpha: 0.72, duration: 98000 },
      { x: -620, y: 455, scale: 1.8, alpha: 0.52, duration: 132000 },
      { x: -430, y: 760, scale: 1.45, alpha: 0.45, duration: 116000 },
    ];

    clouds.forEach((config) => {
      const cloud = this.add.image(config.x, config.y, 'harptepe-cloud-shadow')
        .setDepth(4)
        .setScale(config.scale)
        .setAlpha(config.alpha);
      this.tweens.add({
        targets: cloud,
        x: WORLD_WIDTH + 360,
        duration: config.duration,
        repeat: -1,
      });
    });
  }

  private createAmbientLife() {
    createShipTexture(this);
    const ship = this.add.image(-120, 918, 'harptepe-ambient-ship')
      .setDepth(4)
      .setScale(0.72)
      .setAlpha(0.88);
    this.tweens.add({
      targets: ship,
      x: WORLD_WIDTH + 140,
      duration: 92000,
      repeat: -1,
    });
    this.tweens.add({
      targets: ship,
      y: 908,
      duration: 3600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createChests() {
    this.chestViews = CHEST_POSITIONS.map((position, index) => {
      const point = percentToWorld(position);
      const body = this.add.rectangle(point.x, point.y + 4, 28, 20, 0x5d3a1f)
        .setStrokeStyle(2, 0x2b1a0d)
        .setDepth(5);
      const lid = this.add.rectangle(point.x, point.y - 7, 32, 12, 0x7a4c27)
        .setStrokeStyle(2, 0x2b1a0d)
        .setDepth(5);
      const band = this.add.rectangle(point.x, point.y + 1, 5, 27, 0xb98532)
        .setDepth(6);
      const label = this.add.text(point.x, point.y + 1, String(index + 1), {
        fontFamily: 'Cinzel, Georgia, serif',
        fontSize: '10px',
        color: '#f0dfb2',
        fontStyle: '700',
      }).setOrigin(0.5).setDepth(7);
      return { body, lid, band, label };
    });
  }

  private createKingdoms() {
    KINGDOMS.forEach((definition) => {
      const kingdomId = definition.id;
      const position = percentToWorld(KINGDOM_POSITIONS[kingdomId]);
      const textureKey = `kingdom-marker-${kingdomId}`;
      const color = colorNumber(definition.color);
      createKingdomMarkerTexture(this, textureKey, definition.color);

      const selection = this.add.ellipse(0, 2, 106, 88)
        .setStrokeStyle(4, color, 0.95)
        .setVisible(false);
      const marker = this.add.image(0, -3, textureKey).setDisplaySize(86, 86);
      const namePlate = this.add.rectangle(0, 45, 112, 30, 0xdec794, 0.95)
        .setStrokeStyle(1.5, 0x5d3a1f, 0.72);
      const name = this.add.text(0, 39, definition.name.toUpperCase(), {
        fontFamily: 'Cinzel, Georgia, serif',
        fontSize: '15px',
        color: '#2c1b0d',
        fontStyle: '700',
      }).setOrigin(0.5);
      const epithet = this.add.text(0, 53, definition.epithet, {
        fontFamily: '"IM Fell English", Georgia, serif',
        fontSize: '10px',
        color: '#6e522d',
      }).setOrigin(0.5);
      const statsPlate = this.add.rectangle(0, 72, 91, 18, 0x2b1a0d, 0.9)
        .setStrokeStyle(1, 0xb98532, 0.48);
      const stats = this.add.text(0, 72, '', {
        fontFamily: 'Cinzel, Georgia, serif',
        fontSize: '10px',
        color: '#f0dfb2',
        fontStyle: '700',
      }).setOrigin(0.5);

      const container = this.add.container(position.x, position.y, [
        selection,
        marker,
        namePlate,
        name,
        epithet,
        statsPlate,
        stats,
      ]).setDepth(10);

      const hit = this.add.zone(position.x, position.y + 13, 126, 132)
        .setInteractive({ useHandCursor: true })
        .setDepth(30);
      hit.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        const distance = Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.upX, pointer.upY);
        if (distance < 9) this.bridge.onSelect(kingdomId);
      });
      hit.on('pointerover', () => container.setScale(1.055));
      hit.on('pointerout', () => container.setScale(this.bridge.selectedKingdom === kingdomId ? 1.04 : 1));

      this.kingdomViews[kingdomId] = { container, selection, stats, namePlate, statsPlate };
    });
  }

  private createCompass() {
    const x = WORLD_WIDTH - 112;
    const y = WORLD_HEIGHT - 104;
    const compass = this.add.graphics().setDepth(3).setAlpha(0.32);
    compass.lineStyle(2, 0x6b522d, 0.8);
    compass.strokeCircle(x, y, 42);
    compass.strokeCircle(x, y, 25);
    compass.beginPath();
    compass.moveTo(x, y - 52);
    compass.lineTo(x + 10, y);
    compass.lineTo(x, y + 52);
    compass.lineTo(x - 10, y);
    compass.closePath();
    compass.stroke();
    compass.lineStyle(1, 0x6b522d, 0.6);
    compass.lineBetween(x - 34, y, x + 34, y);
    compass.lineBetween(x, y - 34, x, y + 34);
  }

  private setupInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.primaryDown && !pointer.wasTouch) return;
      if (this.input.pointer1?.isDown && this.input.pointer2?.isDown) {
        this.pinching = true;
        this.dragPointerId = null;
        this.pinchStartDistance = Phaser.Math.Distance.Between(
          this.input.pointer1.x,
          this.input.pointer1.y,
          this.input.pointer2.x,
          this.input.pointer2.y,
        );
        this.pinchStartZoom = this.userZoom;
        this.bridge.onDraggingChange?.(false);
        return;
      }
      this.dragPointerId = pointer.pointerId;
      this.lastDragX = pointer.x;
      this.lastDragY = pointer.y;
      this.bridge.onDraggingChange?.(true);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.pinching && this.input.pointer1?.isDown && this.input.pointer2?.isDown) {
        const first = this.input.pointer1;
        const second = this.input.pointer2;
        const distance = Phaser.Math.Distance.Between(first.x, first.y, second.x, second.y);
        if (distance > 0 && this.pinchStartDistance > 0) {
          const targetZoom = this.pinchStartZoom * (distance / this.pinchStartDistance);
          const centerX = (first.x + second.x) / 2;
          const centerY = (first.y + second.y) / 2;
          this.zoomAt(centerX, centerY, targetZoom / this.userZoom);
        }
        return;
      }
      if (this.dragPointerId !== pointer.pointerId || !pointer.isDown) return;
      const camera = this.cameras.main;
      camera.scrollX -= (pointer.x - this.lastDragX) / camera.zoom;
      camera.scrollY -= (pointer.y - this.lastDragY) / camera.zoom;
      this.lastDragX = pointer.x;
      this.lastDragY = pointer.y;
      this.clampCamera();
    });

    this.input.on('pointerup', this.endDrag, this);
    this.input.on('pointerupoutside', this.endDrag, this);
    this.input.on('pointercancel', this.endDrag, this);

    this.input.on('wheel', (
      pointer: Phaser.Input.Pointer,
      _currentlyOver: Phaser.GameObjects.GameObject[],
      _deltaX: number,
      deltaY: number,
    ) => {
      this.zoomAt(pointer.x, pointer.y, deltaY < 0 ? 1.15 : 0.87);
    });
  }

  private endDrag(pointer: Phaser.Input.Pointer) {
    if (this.pinching && (!this.input.pointer1?.isDown || !this.input.pointer2?.isDown)) {
      this.pinching = false;
    }
    if (this.dragPointerId !== pointer.pointerId) return;
    this.dragPointerId = null;
    this.bridge.onDraggingChange?.(false);
  }

  private handleResize() {
    this.fitCamera(false);
  }

  private fitCamera(resetUserZoom: boolean) {
    const camera = this.cameras.main;
    if (!camera.width || !camera.height) return;
    this.baseZoom = Math.max(camera.width / WORLD_WIDTH, camera.height / WORLD_HEIGHT);
    if (resetUserZoom) this.userZoom = 1;
    camera.setZoom(this.baseZoom * this.userZoom);
    if (resetUserZoom) camera.centerOn(WORLD_WIDTH / 2, CAMERA_HOME_Y);
    this.clampCamera();
  }

  private clampCamera() {
    const camera = this.cameras.main;
    const viewWidth = camera.width / camera.zoom;
    const viewHeight = camera.height / camera.zoom;
    const maxX = Math.max(0, WORLD_WIDTH - viewWidth);
    const maxY = Math.max(0, WORLD_HEIGHT - viewHeight);
    camera.scrollX = Phaser.Math.Clamp(camera.scrollX, 0, maxX);
    camera.scrollY = Phaser.Math.Clamp(camera.scrollY, 0, maxY);
  }

  zoomAt(pointerX: number, pointerY: number, factor: number) {
    const camera = this.cameras.main;
    const before = camera.getWorldPoint(pointerX, pointerY, new Phaser.Math.Vector2());
    this.userZoom = Phaser.Math.Clamp(this.userZoom * factor, MIN_USER_ZOOM, MAX_USER_ZOOM);
    camera.setZoom(this.baseZoom * this.userZoom);
    const after = camera.getWorldPoint(pointerX, pointerY, new Phaser.Math.Vector2());
    camera.scrollX += before.x - after.x;
    camera.scrollY += before.y - after.y;
    this.clampCamera();
  }

  zoomCenter(factor: number) {
    const camera = this.cameras.main;
    this.zoomAt(camera.width / 2, camera.height / 2, factor);
  }

  resetCamera() {
    this.userZoom = 1;
    this.cameras.main.setZoom(this.baseZoom);
    this.cameras.main.centerOn(WORLD_WIDTH / 2, CAMERA_HOME_Y);
    this.clampCamera();
  }

  syncDynamic() {
    const state = this.bridge.state;

    KINGDOMS.forEach((definition) => {
      const view = this.kingdomViews[definition.id];
      if (!view) return;
      const kingdom = state.kingdoms[definition.id];
      const score = calculateKingdomScore(state, definition.id);
      const selected = this.bridge.selectedKingdom === definition.id;
      view.stats.setText(`${score.total} PP · ${kingdom.military} asker`);
      view.selection.setVisible(selected);
      view.container.setScale(selected ? 1.04 : 1);
      view.namePlate.setFillStyle(selected ? 0xf0dfb2 : 0xdec794, selected ? 0.98 : 0.95);
      view.statsPlate.setFillStyle(selected ? colorNumber(definition.color) : 0x2b1a0d, selected ? 0.82 : 0.9);
    });

    state.chests.forEach((chest, index) => {
      const view = this.chestViews[index];
      if (!view) return;
      const palette = {
        locked: { body: 0x51321c, lid: 0x684022, band: 0x7c6334 },
        available: { body: 0x6f421e, lid: 0x9a612b, band: 0xe2bb67 },
        claimed: { body: 0x3d362c, lid: 0x514538, band: 0x77705e },
      }[chest.status];
      view.body.setFillStyle(palette.body, chest.status === 'claimed' ? 0.7 : 1);
      view.lid.setFillStyle(palette.lid, chest.status === 'claimed' ? 0.7 : 1);
      view.band.setFillStyle(palette.band, chest.status === 'available' ? 1 : 0.78);
      view.label.setText(String(chest.id));
      view.label.setAlpha(chest.status === 'claimed' ? 0.48 : 0.92);
    });
  }

  update(time: number) {
    const selected = this.kingdomViews[this.bridge.selectedKingdom];
    if (!selected?.selection.visible) return;
    const pulse = (Math.sin(time / 280) + 1) / 2;
    selected.selection.setAlpha(0.56 + pulse * 0.28);
    selected.selection.setScale(1 + pulse * 0.025);
  }
}
