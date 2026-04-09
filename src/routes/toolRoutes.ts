import { Router } from 'express';
import { createTool, deleteTool, getToolById, getTools, updateTool } from '../controllers/toolController.js';
import { toolCreateSchema, toolUpdateSchema } from '../schemas/toolSchema.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

/**
 * @openapi
 * /api/tools:
 *   get:
 *     summary: Retrieve all tools (with filtering and pagination)
 *     tags:
 *       - Tools
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name (partial match)
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: owner_department
 *         schema:
 *           type: string
 *           enum: [Engineering, Sales, Marketing, HR, Finance, Operations, Design]
 *         description: Filter by owning department
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Paginated list of tools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *   post:
 *     summary: Create a new tool
 *     tags:
 *       - Tools
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tool created successfully
 *       400:
 *         description: Validation error
 */
router.get('/', getTools);
router.post('/', validate(toolCreateSchema), createTool);

/**
 * @openapi
 * /api/tools/{id}:
 *   get:
 *     summary: Get tool by ID
 *     tags:
 *       - Tools
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tool ID
 *     responses:
 *       200:
 *         description: Tool retrieved successfully
 *       404:
 *         description: Tool not found
 *   put:
 *     summary: Update tool by ID (partial update supported)
 *     tags:
 *       - Tools
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tool ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tool updated successfully
 *       404:
 *         description: Tool not found
 *   delete:
 *     summary: Delete a tool by ID
 *     tags:
 *       - Tools
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tool ID
 *     responses:
 *       204:
 *         description: Tool deleted successfully (no content)
 *       404:
 *         description: Tool not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getToolById);
router.put('/:id', validate(toolUpdateSchema), updateTool);
router.delete('/:id', deleteTool);

export default router;
