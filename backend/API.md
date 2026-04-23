# API 文档

本文档描述 Web Resume Generator 后端提供的 REST API。

**基础 URL**：`http://localhost:5001/api/v1`

**通用响应格式**：
```json
{
  "status": "success | error",
  "message": "可选描述",
  "data": { ... }
}
```

---

## 健康检查

### `GET /health`

返回服务健康状态。

**响应示例**：
```json
{
  "status": "healthy",
  "timestamp": "2026-04-23T02:30:45.805Z",
  "service": "web-resume-api",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## 简历管理

### `GET /api/v1/resumes`

分页查询当前用户的简历列表。

**查询参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1，最小 1 |
| limit | int | 否 | 每页数量，默认 20，最大 100 |
| search | string | 否 | 搜索关键词 |

**响应示例**：
```json
{
  "status": "success",
  "data": {
    "resumes": [...],
    "pagination": { "page": 1, "limit": 20, "total": 5, "pages": 1 }
  }
}
```

### `POST /api/v1/resumes`

创建新简历。

**请求体**：
```json
{
  "title": "My Resume",
  "content": { "personal": { ... }, "education": [...], "sections": [...], "skills": [...] },
  "templateId": "uuid-string",
  "settings": { "colorScheme": "awesome-red" }
}
```

### `GET /api/v1/resumes/:id`

获取指定简历详情。

### `PUT /api/v1/resumes/:id`

更新简历。

**请求体**（可选字段）：
```json
{
  "title": "Updated Title",
  "content": { ... },
  "settings": { ... },
  "isPublic": true
}
```

### `DELETE /api/v1/resumes/:id`

删除简历。

### `POST /api/v1/resumes/:id/duplicate`

复制简历。

**请求体**（可选）：
```json
{
  "title": "Copy of My Resume"
}
```

### `GET /api/v1/resumes/sample`

获取示例简历数据。

---

## 工作申请跟踪

### `GET /api/v1/applications`

查询工作申请列表。

**查询参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 筛选状态 |
| company | string | 否 | 公司名筛选 |
| page | int | 否 | 页码，默认 1 |
| limit | int | 否 | 每页数量，默认 50，最大 100 |

**响应示例**：
```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "id": "bf579f24-d4d6-4b14-86d6-a52c255b5bdc",
        "userId": "user-id-mock",
        "company": "TestCorp",
        "jobTitle": "Software Engineer",
        "location": "Tokyo",
        "status": "applied",
        "stage": "Resume submitted",
        "appliedAt": "2026-04-23T02:36:08.289Z",
        "source": "LinkedIn",
        "notes": "First test application",
        "resumeId": null,
        "interviews": []
      }
    ]
  }
}
```

### `POST /api/v1/applications`

创建新工作申请。

**请求体**：
```json
{
  "company": "TestCorp",
  "jobTitle": "Software Engineer",
  "location": "Tokyo",
  "status": "applied",
  "stage": "Resume submitted",
  "appliedAt": "2026-04-23T00:00:00Z",
  "source": "LinkedIn",
  "notes": "Optional notes",
  "resumeId": "uuid-or-null"
}
```

**必填字段**：`company`, `jobTitle`

### `GET /api/v1/applications/:id`

获取单个工作申请详情（包含面试列表）。

### `PUT /api/v1/applications/:id`

更新工作申请。

### `DELETE /api/v1/applications/:id`

删除工作申请。

### `GET /api/v1/applications/:id/interviews`

查询指定申请下的面试列表。

### `POST /api/v1/applications/:id/interviews`

为指定申请添加面试记录。

**请求体**：
```json
{
  "round": 1,
  "interviewType": "Phone",
  "interviewer": "Alice",
  "scheduledAt": "2026-04-25T10:00:00Z",
  "outcome": "pending",
  "feedback": "Good communication skills",
  "notes": "Initial phone screen"
}
```

---

## PDF / Typst 编译

### `POST /api/v1/pdf/generate`

直接提交 Typst 源码并编译为 PDF。

**请求体**：
```json
{
  "typst": "#import \"awesome-cv.typ\": *\n...",
  "cacheKey": "optional-cache-key"
}
```

### `POST /api/v1/pdf/generate-from-resume/:id`

根据已有简历生成 PDF（当前为占位实现）。

### `GET /api/v1/pdf/preview-template/:templateName`

为指定模板生成预览 PDF。

### `GET /api/v1/pdf/download/:cacheKey`

下载已生成的 PDF。

### `GET /api/v1/pdf/preview/:cacheKey`

在浏览器内联预览 PDF。

### `GET /api/v1/pdf/refresh-all-previews`

刷新所有模板预览（管理接口）。

---

## 模板管理

### `GET /api/v1/templates`

获取模板列表（当前为模拟数据）。

### `GET /api/v1/templates/:id`

获取模板详情。

---

## 认证（占位）

### `POST /api/v1/auth/register`

用户注册（当前返回 503）。

### `POST /api/v1/auth/login`

用户登录（当前返回 503）。

---

## 错误码说明

| HTTP 状态码 | 说明 |
|-------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数校验失败 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 502 | 外部服务（Typst 编译）不可用 |
| 503 | 功能暂未启用 |
