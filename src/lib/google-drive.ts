import { google } from 'googleapis';

export interface DriveFile {
  id: string;
  name: string;
  data: any;
}

export class GoogleDriveStorage {
  private drive;
  private folderId: string | null = null;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth });
  }

  private async getOrCreateAppFolder(): Promise<string> {
    if (this.folderId) return this.folderId;

    const folderName = 'HRVision_Data';
    
    // Buscar pasta existente
    const response = await this.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files && response.data.files.length > 0) {
      this.folderId = response.data.files[0].id!;
      return this.folderId;
    }

    // Criar pasta se não existir
    const folder = await this.drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    this.folderId = folder.data.id!;
    return this.folderId;
  }

  async saveData(fileName: string, data: any): Promise<string> {
    const folderId = await this.getOrCreateAppFolder();
    const content = JSON.stringify(data, null, 2);

    // Verificar se arquivo já existe
    const existing = await this.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
    });

    if (existing.data.files && existing.data.files.length > 0) {
      // Atualizar arquivo existente
      const fileId = existing.data.files[0].id!;
      await this.drive.files.update({
        fileId,
        media: {
          mimeType: 'application/json',
          body: content,
        },
      });
      return fileId;
    }

    // Criar novo arquivo
    const file = await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body: content,
      },
      fields: 'id',
    });

    return file.data.id!;
  }

  async getData(fileName: string): Promise<any | null> {
    const folderId = await this.getOrCreateAppFolder();

    const response = await this.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
    });

    if (!response.data.files || response.data.files.length === 0) {
      return null;
    }

    const fileId = response.data.files[0].id!;
    const file = await this.drive.files.get({
      fileId,
      alt: 'media',
    });

    return file.data;
  }

  async listFiles(pattern?: string): Promise<DriveFile[]> {
    const folderId = await this.getOrCreateAppFolder();
    
    let query = `'${folderId}' in parents and trashed=false`;
    if (pattern) {
      query += ` and name contains '${pattern}'`;
    }

    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    if (!response.data.files) return [];

    const files: DriveFile[] = [];
    for (const file of response.data.files) {
      const data = await this.getData(file.name!);
      files.push({
        id: file.id!,
        name: file.name!,
        data,
      });
    }

    return files;
  }

  async deleteData(fileName: string): Promise<void> {
    const folderId = await this.getOrCreateAppFolder();

    const response = await this.drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
    });

    if (response.data.files && response.data.files.length > 0) {
      await this.drive.files.delete({
        fileId: response.data.files[0].id!,
      });
    }
  }
}
