#!/usr/bin/env node
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pipeline } from 'node:stream/promises';
import https from 'node:https';
import AdmZip from 'adm-zip';

const DATA_URL = process.env.OULAD_ZIP_URL ?? 'https://analyse.kmi.open.ac.uk/open_dataset/download';
const REQUIRED_FILES = [
  'studentInfo.csv',
  'courses.csv',
  'studentVle.csv',
  'assessments.csv',
  'studentAssessment.csv',
  'vle.csv',
];

const root = path.resolve(process.cwd());
const rawDir = path.join(root, 'public', 'data', 'oulad', 'raw');

const downloadFile = async (url, output) => {
  await fs.mkdir(path.dirname(output), { recursive: true });
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(
            new Error(`Gagal mengunduh dataset (status ${response.statusCode}). URL: ${url}`),
          );
          return;
        }
        const total = Number(response.headers['content-length'] ?? 0);
        let received = 0;
        response.on('data', (chunk) => {
          received += chunk.length;
          if (total) {
            process.stdout.write(
              `\rMengunduh OULAD ${(received / total * 100).toFixed(1)}% (${(received / 1024 / 1024).toFixed(1)} MB)`,
            );
          }
        });
        const fileStream = createWriteStream(output);
        pipeline(response, fileStream)
          .then(() => {
            process.stdout.write('\n');
            resolve(output);
          })
          .catch(reject);
      })
      .on('error', reject);
  });
};

const extractFiles = async (zipPath) => {
  const zip = new AdmZip(zipPath);
  await fs.mkdir(rawDir, { recursive: true });
  for (const filename of REQUIRED_FILES) {
    const entry = zip.getEntry(filename);
    if (!entry) {
      throw new Error(`File ${filename} tidak ditemukan di paket OULAD.`);
    }
    const content = zip.readFile(entry);
    const destination = path.join(rawDir, filename);
    await fs.writeFile(destination, content);
  }
};

const main = async () => {
  console.log('[fetch:data] Menyiapkan pengunduhan dataset OULAD...');
  const tmpFile = path.join(tmpdir(), `oulad-${Date.now()}.zip`);
  try {
    await downloadFile(DATA_URL, tmpFile);
    console.log('[fetch:data] Unduhan selesai. Mengekstrak file penting...');
    await extractFiles(tmpFile);
    console.log(`[fetch:data] Dataset berhasil diekstrak ke ${rawDir}`);
  } catch (error) {
    console.error('\n[fetch:data] Gagal memproses dataset OULAD.');
    console.error(
      `Silakan unduh manual dari ${DATA_URL} dan ekstrak file berikut ke ${rawDir}: ${REQUIRED_FILES.join(
        ', ',
      )}.`,
    );
    console.error(error);
    process.exitCode = 1;
  } finally {
    await fs.rm(tmpFile, { force: true }).catch(() => {});
  }
};

main();
