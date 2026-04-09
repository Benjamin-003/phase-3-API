import { Router } from 'express';
import { getDepartmentCosts, getExpensiveTools, getLowUsageTools, getToolsByCategory, getVendorSummary } from '../controllers/analyticController.js';
import { validate } from '../middlewares/validate.js';
import { lowUsageSchema } from '../schemas/analyticSchema.js';

const router = Router();

/**
 * @openapi
 * /api/analytics/department-costs:
 *   get:
 *     summary: Get budget distribution by department
 *     description: Provides total costs, tool counts, and percentages for ROI analysis.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Budget distribution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 */
router.get('/department-costs', getDepartmentCosts);

/**
 * @openapi
 * /api/analytics/tools-by-category:
 *   get:
 *     summary: Analyze technology stack by category
 *     description: Provides cost distribution, tool volume, and efficiency metrics per category.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Category analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 insights:
 *                   type: object
 */
router.get('/tools-by-category', getToolsByCategory);

/**
 * @openapi
 * /api/analytics/low-usage-tools:
 *   get:
 *     summary: Identify underutilized tools for cost optimization
 *     description: Lists tools with low adoption relative to cost to highlight savings potential.
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: max_users
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of active users to consider a tool underutilized
 *     responses:
 *       200:
 *         description: List of low usage tools and savings analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/low-usage-tools', validate(lowUsageSchema), getLowUsageTools);

/**
 * @openapi
 * /api/analytics/vendor-summary:
 *   get:
 *     summary: Analyse globale par fournisseur
 *     description: Agrège les coûts et l'efficience par fournisseur pour optimiser les renouvellements.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Analyse des fournisseurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/vendor-summary', getVendorSummary);
/**
 * @openapi
 * /api/analytics/expensive-tools:
 *   get:
 *     summary: Get tools with the highest cost per user
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: minCost
 *         schema:
 *           type: number
 *           default: 100
 *         description: Minimum monthly cost threshold
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: List of expensive tools retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 threshold:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.get('/expensive-tools', getExpensiveTools);
export default router;