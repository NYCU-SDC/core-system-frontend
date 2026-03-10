import { Button } from "@/shared/components";
import { Application, extend, useApplication } from "@pixi/react";
import { Container, FederatedMouseEvent, Graphics, Rectangle, Sprite, Texture, type PointData, type Size } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./EditPage.module.css";

extend({
	Container,
	Sprite,
	Graphics
});

interface DynamicArrowProps {
	startPos: PointData;
	endPos: PointData;
	startSize: Size;
	endSize?: Size;
}

const DynamicArrow = ({ startPos, endPos, startSize, endSize }: DynamicArrowProps) => {
	const draw = useCallback(
		(g: Graphics) => {
			g.clear();

			const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
			const headLength = 18;
			const headAngle = Math.PI / 6;

			const endInnerLength = endSize ? Math.min(endSize.width / 2 / Math.abs(Math.cos(angle)), endSize.height / 2 / Math.abs(Math.sin(angle))) : 0;
			const startInnerLength = Math.min(startSize.width / 2 / Math.abs(Math.cos(angle)), startSize.height / 2 / Math.abs(Math.sin(angle)));

			const arrowX = endPos.x - endInnerLength * Math.cos(angle);
			const arrowY = endPos.y - endInnerLength * Math.sin(angle);

			const startX = startPos.x + startInnerLength * Math.cos(angle);
			const startY = startPos.y + startInnerLength * Math.sin(angle);

			g.moveTo(arrowX, arrowY);
			const arrowP1 = {
				x: arrowX - headLength * Math.cos(angle - headAngle),
				y: arrowY - headLength * Math.sin(angle - headAngle)
			};

			const arrowP2 = {
				x: arrowX - headLength * Math.cos(angle + headAngle),
				y: arrowY - headLength * Math.sin(angle + headAngle)
			};

			g.poly([arrowX, arrowY, arrowP1.x, arrowP1.y, arrowP2.x, arrowP2.y]);
			g.fill({ color: 0xffffff });

			g.moveTo(startX, startY);
			g.lineTo(arrowX, arrowY);
			g.stroke({
				width: 3,
				color: 0xffffff,
				cap: "round",
				join: "round"
			});
		},
		[startPos, endPos, startSize, endSize]
	);

	return <pixiGraphics draw={draw} />;
};

interface ResizableRectangleProps {
	x: number;
	y: number;
	shape: Shape;
	setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
	isDragging: boolean;
	onDragStart: (e: FederatedMouseEvent) => void;
	onResizeStart: (e: FederatedMouseEvent) => void;
	onLinkStart: (e: FederatedMouseEvent) => void;
}

const ResizableRectangle = ({ x, y, shape, setShapes, isDragging, onDragStart, onLinkStart }: ResizableRectangleProps) => {
	const [isHovered, setIsHovered] = useState(false);

	const handlePointerOver = () => setIsHovered(true);
	const handlePointerOut = () => setIsHovered(false);

	const handleCreateNode = (x: number, y: number) => {
		const newNode: Shape = {
			id: uuidv4(),
			x,
			y,
			width: 100,
			height: 100,
			next: []
		};
		setShapes(prev =>
			prev
				.map(s =>
					s.id === shape.id
						? {
								...s,
								next: [...(s.next || []), { id: newNode.id }]
							}
						: s
				)
				.concat(newNode)
		);
	};

	const isFocused = isHovered && !isDragging;

	const padding = 20;

	return (
		<pixiContainer
			x={x}
			y={y}
			onPointerOver={handlePointerOver}
			onPointerOut={handlePointerOut}
			interactive={true}
			anchor={0.5}
			hitArea={new Rectangle(-padding, -padding, shape.width + padding * 2, shape.height + padding * 2)}
		>
			<pixiSprite texture={Texture.WHITE} width={shape.width} height={shape.height} tint="#ff9900" eventMode="static" cursor="pointer" alpha={isDragging ? 0.5 : 1} onPointerDown={onDragStart} />

			{shape.isSelecting && (
				<pixiGraphics
					draw={g => {
						g.clear();
						g.rect(0, 0, shape.width, shape.height);
						g.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
					}}
				/>
			)}
			{isFocused && (
				<>
					{/* Top Dot */}
					<pixiSprite
						texture={Texture.WHITE}
						x={shape.width / 2}
						y={-10}
						width={10}
						height={10}
						anchor={0.5}
						tint="#00ff00"
						eventMode="static"
						cursor="pointer"
						onClick={() => handleCreateNode(shape.x, shape.y - shape.height - 50)}
						onPointerDown={(e: FederatedMouseEvent) => onLinkStart(e)}
					/>
					{/* Bottom Dot */}
					<pixiSprite
						texture={Texture.WHITE}
						x={shape.width / 2}
						y={shape.height + 10}
						width={10}
						height={10}
						anchor={0.5}
						tint="#00ff00"
						eventMode="static"
						cursor="pointer"
						onClick={() => handleCreateNode(shape.x, shape.y + shape.height + 50)}
						onPointerDown={(e: FederatedMouseEvent) => onLinkStart(e)}
					/>
					{/* Left Dot */}
					<pixiSprite
						texture={Texture.WHITE}
						x={-10}
						y={shape.height / 2}
						width={10}
						height={10}
						anchor={0.5}
						tint="#00ff00"
						eventMode="static"
						cursor="pointer"
						onClick={() => handleCreateNode(shape.x - shape.width - 50, shape.y)}
						onPointerDown={(e: FederatedMouseEvent) => onLinkStart(e)}
					/>
					{/* Right Dot */}
					<pixiSprite
						texture={Texture.WHITE}
						x={shape.width + 10}
						y={shape.height / 2}
						width={10}
						height={10}
						anchor={0.5}
						tint="#00ff00"
						eventMode="static"
						cursor="pointer"
						onClick={() => handleCreateNode(shape.x + shape.width + 50, shape.y)}
						onPointerDown={(e: FederatedMouseEvent) => onLinkStart(e)}
					/>
				</>
			)}
		</pixiContainer>
	);
};

interface InteractiveStageProps {
	shapes: Shape[];
	setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
	arrows: Arrow[];
}

type Action = {
	type: "drag" | "resize";
	index: number;
	offsetX: number;
	offsetY: number;
};

const InteractiveStage = ({ shapes, setShapes, arrows }: InteractiveStageProps) => {
	const { app } = useApplication();

	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [stageScale, setStageScale] = useState(1);
	const [action, setAction] = useState<Action | null>(null);
	const [isSelecting, setIsSelecting] = useState(false);
	const [startPos, setStartPos] = useState<PointData>({ x: 0, y: 0 });
	const [currentPos, setCurrentPos] = useState<PointData>({ x: 0, y: 0 });

	const [linking, setLinking] = useState<Shape | null>(null);

	// Dragging state for panning the stage
	const draggingRef = useRef(false);
	const lastPos = useRef({ x: 0, y: 0 });

	const containerRef = useRef<Container>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				if (e.key === "=" || e.key === "+") {
					e.preventDefault();
					setStageScale(prev => Math.min(prev + 0.1, 3));
				} else if (e.key === "-") {
					e.preventDefault();
					setStageScale(prev => Math.max(prev - 0.1, app.screen.width / (window.innerWidth * 5), app.screen.height / (window.innerHeight * 5)));
				}
			}
			if (e.key === "Delete") {
				e.preventDefault();
				setShapes(prev => {
					const idsToDelete = new Set(prev.filter(shape => shape.isSelecting).map(s => s.id));
					return prev
						.filter(shape => !idsToDelete.has(shape.id))
						.map(shape => {
							if (shape.next.some(next => idsToDelete.has(next.id))) {
								return { ...shape, next: shape.next.filter(next => !idsToDelete.has(next.id)) };
							}
							return shape;
						});
				});
				setDraggedIndex(null);
				setIsSelecting(false);
				setAction(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [app.screen.width, app.screen.height, setShapes]);

	useEffect(() => {
		const canvas = app.canvas;
		const handleContextMenu = (e: MouseEvent) => e.preventDefault();

		canvas.addEventListener("contextmenu", handleContextMenu);
		return () => canvas.removeEventListener("contextmenu", handleContextMenu);
	}, [app]);

	const drawSelectionBox = useCallback(
		(g: Graphics) => {
			g.clear();
			if (!isSelecting) return;
			const x = Math.min(startPos.x, currentPos.x);
			const y = Math.min(startPos.y, currentPos.y);
			const width = Math.abs(currentPos.x - startPos.x);
			const height = Math.abs(currentPos.y - startPos.y);
			g.rect(x, y, width, height);
			g.fill({ color: 0x0088ff, alpha: 0.2 });
			g.stroke({ width: 2, color: 0x0088ff, alpha: 0.8 });
		},
		[startPos, currentPos, isSelecting]
	);

	const handleLinkStart = (e: FederatedMouseEvent, shape: Shape) => {
		e.stopPropagation();
		setLinking(shape);
		if (containerRef.current) {
			const localPos = containerRef.current.toLocal(e.global);
			setCurrentPos(localPos);
		}
	};

	// Preprocess shapes to create a mapping of id to shape for easy lookup
	const shapeMap = shapes.reduce(
		(map, shape) => {
			map[shape.id] = shape;
			return map;
		},
		{} as Record<string, Shape>
	);

	const handleContainerPointerDown = (e: FederatedMouseEvent) => {
		if (e.nativeEvent.button === 1) return;

		if (e.target === e.currentTarget) {
			draggingRef.current = e.nativeEvent.button === 2;
			setIsSelecting(e.nativeEvent.button === 0);
			lastPos.current = { x: e.global.x, y: e.global.y };

			if (containerRef.current) {
				const localPos = containerRef.current.toLocal(e.global);
				setStartPos(localPos);
				setCurrentPos(localPos);
			}
		}
	};

	const handleContainerPointerUp = () => {
		if (draggingRef.current) {
			draggingRef.current = false;
		}
		if (isSelecting) {
			const newShapes = shapes.map(shape => {
				if (
					shape.x + shape.width > Math.min(startPos.x, currentPos.x) &&
					shape.x < Math.max(startPos.x, currentPos.x) &&
					shape.y + shape.height > Math.min(startPos.y, currentPos.y) &&
					shape.y < Math.max(startPos.y, currentPos.y)
				) {
					return { ...shape, isSelecting: true };
				} else {
					return { ...shape, isSelecting: false };
				}
			});

			setShapes(newShapes);
			setIsSelecting(false);
		}
	};

	const handleContainerDragging = (e: FederatedMouseEvent) => {
		if (!draggingRef.current || !lastPos.current) return;

		const c = containerRef.current as Container;
		if (!c) return;

		const dx = e.global.x - lastPos.current.x;
		const dy = e.global.y - lastPos.current.y;

		const newX = c.x + dx;
		const newY = c.y + dy;
		const minX = app.screen.width - c.width;
		const minY = app.screen.height - c.height;

		c.x = Math.min(0, Math.max(newX, minX));
		c.y = Math.min(0, Math.max(newY, minY));

		lastPos.current = { x: e.global.x, y: e.global.y };
	};

	const handleContainerSelecting = (e: FederatedMouseEvent) => {
		if (!isSelecting || !containerRef.current) return;
		const localPos = containerRef.current.toLocal(e.global);
		setCurrentPos(localPos);
	};

	const handleLinking = (e: FederatedMouseEvent) => {
		if (!linking || !containerRef.current) return;
		const localPos = containerRef.current.toLocal(e.global);
		setCurrentPos(localPos);
	};

	const handleContainerPointerMove = (e: FederatedMouseEvent) => {
		handleContainerDragging(e);
		handleContainerSelecting(e);
	};

	const handlePointerUp = () => {
		if (linking) {
			const targetShape = shapes.find(shape => {
				const shapeX = shape.x;
				const shapeY = shape.y;
				const shapeWidth = shape.width;
				const shapeHeight = shape.height;
				return currentPos.x > shapeX && currentPos.x < shapeX + shapeWidth && currentPos.y > shapeY && currentPos.y < shapeY + shapeHeight && shape.id !== linking.id;
			});

			if (targetShape) {
				setShapes(prev => {
					const newShapes = prev.map(shape => {
						if (shape.id === linking.id) {
							return {
								...shape,
								next: [...(shape.next || []), { id: targetShape.id }]
							};
						}
						return shape;
					});
					return newShapes;
				});
			}
		}
		setDraggedIndex(null);
		setAction(null);
		setIsSelecting(false);
		setLinking(null);
	};

	const handlePointerDown = (index: number, type: "drag" | "resize") => (e: FederatedMouseEvent) => {
		const pointerX = e.global.x / stageScale;
		const pointerY = e.global.y / stageScale;
		const shape = shapes[index];

		e.stopPropagation();
		setDraggedIndex(index);
		setAction({ type, index, offsetX: pointerX - shape.x, offsetY: pointerY - shape.y });
	};

	const handleMove = (e: FederatedMouseEvent) => {
		if (!action) return;

		const pointerX = e.global.x / stageScale;
		const pointerY = e.global.y / stageScale;

		setShapes((prev: Shape[]) => {
			const newShapes = [...prev];
			const shape = newShapes[action.index];

			if (action.type === "drag") {
				shape.x = pointerX - action.offsetX;
				shape.y = pointerY - action.offsetY;
			} else if (action.type === "resize") {
				shape.width = Math.max(40, pointerX - shape.x + 10);
				shape.height = Math.max(40, pointerY - shape.y + 10);
			}

			newShapes[action.index] = shape;
			return newShapes;
		});
	};

	const handlePointerMove = (e: FederatedMouseEvent) => {
		handleMove(e);
		handleLinking(e);
	};

	return (
		<pixiContainer
			eventMode="dynamic"
			hitArea={new Rectangle(0, 0, window.innerWidth * 5, window.innerHeight * 5)}
			scale={stageScale}
			width={window.innerWidth * 5}
			height={window.innerHeight * 5}
			ref={containerRef}
			onPointerDown={handleContainerPointerDown}
			onPointerUp={() => {
				handleContainerPointerUp();
				handlePointerUp();
			}}
			onPointerUpOutside={() => {
				handleContainerPointerUp();
				handlePointerUp();
			}}
			onPointerMove={(e: FederatedMouseEvent) => {
				if (draggingRef.current || isSelecting) {
					handleContainerPointerMove(e);
				} else if (action || linking) {
					handlePointerMove(e);
				}
			}}
		>
			<pixiGraphics
				draw={g => {
					g.clear();
					g.rect(0, 0, window.innerWidth * 5, window.innerHeight * 5);
					g.fill({ color: 0x222222, alpha: 0.5 });
				}}
			/>
			<pixiGraphics
				draw={g => {
					g.clear();
					const gridSize = 50;
					for (let x = 0; x < window.innerWidth * 5; x += gridSize) {
						g.moveTo(x, 0);
						g.lineTo(x, window.innerHeight * 5);
					}
					for (let y = 0; y < window.innerHeight * 5; y += gridSize) {
						g.moveTo(0, y);
						g.lineTo(window.innerWidth * 5, y);
					}
					g.stroke({ width: 3, color: 0xffffff, alpha: 0.2 });
				}}
			/>
			{arrows.map((arrow, index) => (
				<DynamicArrow
					key={index}
					startPos={{
						x: shapeMap[arrow.from].x + shapeMap[arrow.from].width / 2,
						y: shapeMap[arrow.from].y + shapeMap[arrow.from].height / 2
					}}
					startSize={{
						width: shapeMap[arrow.from].width,
						height: shapeMap[arrow.from].height
					}}
					endPos={{
						x: shapeMap[arrow.to].x + shapeMap[arrow.to].width / 2,
						y: shapeMap[arrow.to].y + shapeMap[arrow.to].height / 2
					}}
					endSize={{
						width: shapeMap[arrow.to].width,
						height: shapeMap[arrow.to].height
					}}
				/>
			))}
			{linking && (
				<DynamicArrow
					startPos={{
						x: linking.x + linking.width / 2,
						y: linking.y + linking.height / 2
					}}
					startSize={{
						width: linking.width,
						height: linking.height
					}}
					endPos={{
						x: currentPos.x,
						y: currentPos.y
					}}
				/>
			)}
			{shapes.map((shape, index) => (
				<ResizableRectangle
					key={index}
					x={shape.x}
					y={shape.y}
					shape={shape}
					setShapes={setShapes}
					isDragging={draggedIndex === index}
					onDragStart={handlePointerDown(index, "drag")}
					onResizeStart={handlePointerDown(index, "resize")}
					onLinkStart={e => handleLinkStart(e, shape)}
				/>
			))}
			<pixiGraphics draw={drawSelectionBox} />
		</pixiContainer>
	);
};

type NextShape = {
	id: string;
};

type Shape = {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	next: NextShape[];
	isSelecting?: boolean;
};

type Arrow = {
	from: string;
	to: string;
};

export const AdminFormEditPage = () => {
	const ref = useRef<HTMLDivElement>(null);

	const [shapes, setShapes] = useState<Shape[]>(() => {
		const uuid1 = uuidv4();
		const uuid2 = uuidv4();
		const uuid3 = uuidv4();
		return [
			{ id: uuid1, x: 100, y: 100, width: 100, height: 100, next: [{ id: uuid2 }] },
			{ id: uuid2, x: 100, y: 300, width: 100, height: 100, next: [{ id: uuid3 }] },
			{ id: uuid3, x: 400, y: 300, width: 100, height: 100, next: [] }
		];
	});

	const arrows = useMemo(() => {
		return shapes.flatMap(shape =>
			shape.next.map(next => ({
				from: shape.id,
				to: next.id
			}))
		);
	}, [shapes]);

	const handleAddNode = () => {
		const newNode: Shape = {
			id: uuidv4(),
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
			width: 100,
			height: 100,
			next: []
		};
		setShapes(prev => [...prev, newNode]);
	};

	return (
		<div ref={ref} className={styles.container}>
			<div className={styles.toolbar}>
				<Button className={styles.toolbar} onClick={handleAddNode} variant="secondary">
					Add Node
				</Button>
			</div>
			<Application resizeTo={ref} powerPreference="high-performance" autoDensity={true} antialias={true}>
				<InteractiveStage shapes={shapes} setShapes={setShapes} arrows={arrows} />
			</Application>
		</div>
	);
};
