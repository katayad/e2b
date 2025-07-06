import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Res, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Create a new E2B report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  @Post()
  async create(@Body() createReportDto: any, @Request() req) {
    return this.reportsService.create(
      createReportDto.title,
      createReportDto.data,
      req.user.userId,
    );
  }

  @ApiOperation({ summary: 'Get all reports for current user' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  @Get()
  async findAll(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.reportsService.findAllByUser(req.user.userId, page, limit);
  }

  @ApiOperation({ summary: 'Get a specific report' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.reportsService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Download report as XML' })
  @ApiResponse({ status: 200, description: 'Report downloaded successfully' })
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res() res: Response,
  ) {
    const content = await this.reportsService.getReportContent(id, req.user.userId);
    const report = await this.reportsService.findOne(id, req.user.userId);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title}.xml"`);
    res.send(content);
  }

  @ApiOperation({ summary: 'Update a report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: any,
    @Request() req,
  ) {
    return this.reportsService.update(id, req.user.userId, updateReportDto.data);
  }

  @ApiOperation({ summary: 'Delete a report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.reportsService.delete(id, req.user.userId);
    return { message: 'Report deleted successfully' };
  }
}